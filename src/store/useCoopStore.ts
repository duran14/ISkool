import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import { useStudentStore } from './useStudentStore';

export interface PartyMember {
  student_id: string;
  name: string;
}

export interface PartyAction {
  id: string;
  party_id: string;
  student_id: string;
  damage_dealt: number;
  action_type: string;
  created_at: string;
  student_name?: string;
}

interface CoopStoreState {
  partyId: string | null;
  members: PartyMember[];
  actions: PartyAction[];
  lastAction: PartyAction | null;
  bossHp: number;
  bossMaxHp: number;
  isSubscribed: boolean;
  alerts: string[];
  activeChannel: any;
  
  // Actions
  createParty: (missionId: string) => Promise<string>;
  joinParty: (partyId: string) => Promise<void>;
  sendPartyAction: (damageDealt: number, actionType: string) => Promise<void>;
  subscribeToPartyActions: (partyId: string, onActionReceived?: (action: PartyAction) => void) => () => void;
  leaveParty: () => Promise<void>;
  resetCoopStore: () => void;
}

export const useCoopStore = create<CoopStoreState>((set, get) => ({
  partyId: null,
  members: [],
  actions: [],
  lastAction: null,
  bossHp: 100,
  bossMaxHp: 100,
  isSubscribed: false,
  alerts: [],
  activeChannel: null,

  createParty: async (missionId) => {
    const studentId = useStudentStore.getState().activeStudentId;
    if (!studentId) throw new Error('No hay estudiante activo seleccionado');

    const { data, error } = await supabase
      .from('coop_parties')
      .insert({
        mission_id: missionId,
        created_by: studentId,
        status: 'active'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error al crear la party cooperativa:', error);
      throw error;
    }

    if (!data) throw new Error('No se devolvieron datos de la party creada');

    await get().joinParty(data.id);
    return data.id;
  },

  joinParty: async (partyId) => {
    const studentId = useStudentStore.getState().activeStudentId;
    if (!studentId) return;

    // Call database RPC to validate and join the party
    const { error: joinError } = await supabase.rpc('join_party', {
      party_id_param: partyId
    });

    if (joinError) {
      console.error('Error joining party:', joinError);
      alert(joinError.message || 'La sala a la que intentas unirte ya no existe o ha caducado');
      return;
    }

    set({ partyId });

    // 2. Fetch party members to resolve names
    const { data: membersData, error: membersError } = await supabase
      .from('party_members')
      .select(`
        student_id,
        students:student_id (
          profiles:id (
            first_name,
            last_name
          )
        )
      `)
      .eq('party_id', partyId);

    let mappedMembers: PartyMember[] = [];
    if (membersError) {
      console.error('Error fetching party members:', membersError);
    } else if (membersData) {
      mappedMembers = membersData.map((m: any) => {
        const profile = m.students?.profiles;
        return {
          student_id: m.student_id,
          name: profile ? `${profile.first_name} ${profile.last_name}` : 'Compañero'
        };
      });
      set({ members: mappedMembers });
    }

    // 3. Fetch boss hp if party exists
    const { data: partyData } = await supabase
      .from('coop_parties')
      .select(`
        mission_id,
        missions:mission_id (
          quests:id (
            content
          )
        )
      `)
      .eq('id', partyId)
      .single();

    let maxHp = 100;
    if (partyData) {
      const quests = (partyData as any).missions?.quests || [];
      const bossQuest = quests.find((q: any) => q.content?.bossHp);
      if (bossQuest) {
        maxHp = bossQuest.content.bossHp || 100;
      }
    }
    set({ bossHp: maxHp, bossMaxHp: maxHp });

    // 4. Fetch existing actions
    const { data: actionsData, error: actionsError } = await supabase
      .from('party_actions')
      .select('*')
      .eq('party_id', partyId)
      .order('created_at', { ascending: true });

    let fetchedActions: PartyAction[] = [];
    if (actionsError) {
      console.error('Error fetching party actions:', actionsError);
    } else if (actionsData) {
      fetchedActions = actionsData.map((action: any) => {
        const member = mappedMembers.find(m => m.student_id === action.student_id);
        return {
          ...action,
          student_name: member ? member.name : 'Compañero'
        };
      });
      set({ actions: fetchedActions });
    }

    // Adjust boss HP based on total damage dealt
    const totalDmgDealt = fetchedActions.reduce((sum, act) => sum + act.damage_dealt, 0);
    const calculatedHp = Math.max(0, maxHp - totalDmgDealt);
    set({
      bossHp: calculatedHp,
      bossMaxHp: maxHp
    });

    if (calculatedHp <= 0) {
      await supabase
        .from('coop_parties')
        .update({ status: 'completed' })
        .eq('id', partyId);
    }
  },

  sendPartyAction: async (damageDealt, actionType) => {
    const { partyId, bossHp } = get();
    const studentId = useStudentStore.getState().activeStudentId;
    if (!partyId || !studentId) return;

    if (bossHp <= 0) {
      console.log('El Jefe ya está derrotado. Acción de ataque rechazada.');
      return;
    }

    const { error } = await supabase
      .from('party_actions')
      .insert({
        party_id: partyId,
        student_id: studentId,
        damage_dealt: damageDealt,
        action_type: actionType
      });

    if (error) {
      console.error('Error sending party action:', error);
    }
  },

  subscribeToPartyActions: (partyId, onActionReceived) => {
    // If there is an existing channel, remove it first
    const currentChannel = get().activeChannel;
    if (currentChannel) {
      supabase.removeChannel(currentChannel);
    }

    set({ isSubscribed: true });

    const channel = supabase
      .channel(`coop-party-actions-${partyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'party_actions',
          filter: `party_id=eq.${partyId}`
        },
        async (payload) => {
          // If boss is already dead, ignore incoming attacks
          if (get().bossHp <= 0) {
            console.log('El Jefe ya está derrotado, ignorando ataque recibido.');
            return;
          }

          const newAction = payload.new as PartyAction;
          
          let studentName = 'Compañero';
          const member = get().members.find(m => m.student_id === newAction.student_id);
          if (member) {
            studentName = member.name;
          } else {
            const { data } = await supabase
              .from('profiles')
              .select('first_name')
              .eq('id', newAction.student_id)
              .maybeSingle();
            if (data) studentName = data.first_name;
          }

          const actionWithDetail = {
            ...newAction,
            student_name: studentName
          };

          // Check if action already exists in store
          const alreadyExists = get().actions.some(a => a.id === newAction.id);
          if (alreadyExists) return;

          const newBossHp = Math.max(0, get().bossHp - newAction.damage_dealt);

          set((state) => {
            const updatedActions = [...state.actions, actionWithDetail];
            return {
              bossHp: newBossHp,
              lastAction: actionWithDetail,
              actions: updatedActions,
              alerts: [...state.alerts.slice(-19), `[${studentName}]: Realizó un ataque infligiendo ${newAction.damage_dealt} de daño.`]
            };
          });

          if (onActionReceived) {
            onActionReceived(actionWithDetail);
          }

          // If boss was defeated, update party status to completed
          if (newBossHp <= 0) {
            await supabase
              .from('coop_parties')
              .update({ status: 'completed' })
              .eq('id', partyId);
          }
        }
      )
      .subscribe();

    set({ activeChannel: channel });

    return () => {
      supabase.removeChannel(channel);
      set({ isSubscribed: false, activeChannel: null });
    };
  },

  leaveParty: async () => {
    const { partyId, activeChannel } = get();
    if (activeChannel) {
      await supabase.removeChannel(activeChannel);
    }

    const studentId = useStudentStore.getState().activeStudentId;
    if (partyId && studentId) {
      await supabase
        .from('party_members')
        .delete()
        .eq('party_id', partyId)
        .eq('student_id', studentId);
    }

    set({
      partyId: null,
      members: [],
      actions: [],
      lastAction: null,
      bossHp: 100,
      bossMaxHp: 100,
      isSubscribed: false,
      activeChannel: null,
      alerts: []
    });
  },

  resetCoopStore: () => {
    const { activeChannel } = get();
    if (activeChannel) {
      supabase.removeChannel(activeChannel);
    }
    set({
      partyId: null,
      members: [],
      actions: [],
      lastAction: null,
      bossHp: 100,
      bossMaxHp: 100,
      isSubscribed: false,
      activeChannel: null,
      alerts: []
    });
  }
}));
