import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { generationService } from '../services/generationService';

const useGenerationStore = create(
  devtools(
    (set, get) => ({
      balance: 0,
      isDonut: false,
      isBalanceLoading: false,

      activeTask: null, // { id: string, status: string }
      taskResult: null,
      taskStatus: null,
      isChecking: false,
      isPolling: false,
      pollingInterval: null,
      error: null,

      tabType: '',
      prompt: '',

      message: '',

      generationHistory: [],
      isHistoryLoading: false,
      historyError: null,

      fetchBalance: async () => {
        set({ isBalanceLoading: true });
        try {
          const data = await generationService.getBalance();
          
          set({ 
            balance: data.balance, 
            isDonut: data.isDonut, 
            isBalanceLoading: false 
          });
        } catch (error) {
          console.error("Ошибка при получении баланса:", error);
          set({ isBalanceLoading: false });
        }
      },

      generateContent: async (type, payload) => {
        set({ error: null, taskResult: null });

        try {
          const data = await generationService.generateContent(type, payload);
          console.log(data)
          if (data && data.taskId ) {
            set({
              activeTask: { id: data.taskId, status: "processing" },
              isChecking: false,
            });

            get().fetchBalance();
            get().startPolling(data.taskId);

            return data;
          } else if (data && data.message) {
            set({
              message: data.message,
              isChecking: false,
            });
          } else {
            set({
              activeTask: null,
              isChecking: false,
            })
          }
        } catch (error) {
          set({
            error: error.response?.data?.message || error.message,
            isChecking: false,
          });
        }
      },
      
      getGenerationHistory: async (type) => {
        set({ isHistoryLoading: true, historyError: null });

        try {
          const data = await generationService.getGenerationHistory(type);

          if (data && data.items) {
            set({ 
              generationHistory: data.items,
              isHistoryLoading: false,
            });

            return data;
          } else {
            set({
              generationHistory: [],
              isHistoryLoading: false,
            });
          }
        } catch (error) {
          console.error('Ошибка при загрузке истории:', error);
          set({
            isHistoryLoading: false,
            historyError: error.response?.data?.message || error.message,
          });
        }
      },

      clearHistory: () => {
        set({
          generationHistory: [],
          historyError: null,
          isHistoryLoading: false,
        });
      },

      checkAndStartPolling: async () => {
        set({ isChecking: true, error: null });
        
        try {
          const data = await generationService.checkTasks();
          
          if (data.status === 'not ready' && data.taskId) {
    
            set({
              activeTask: {
                id: data.taskId,
                status: 'processing'
              },
              tabType: data.type,
              prompt: data.prompt,
              isPolling: true,
              isChecking: false,
            });
            
            get().startPolling(data.taskId);
            
            return { hasActiveTask: true, taskId: data.taskId };
          } else {
            set({ activeTask: null, isChecking: false });
            return { hasActiveTask: false };
          }
        } catch (error) {
          set({ 
            error: error.response?.data?.message || error.message,
            isChecking: false 
          });
          return { hasActiveTask: false, error: error.message };
        }
      },
      
      startPolling: (taskId) => {
        const { stopPolling } = get();
        
        stopPolling();
        
        set({ isPolling: true, taskResult: null });
        
        const poll = async () => {
          try {
            const data = await generationService.getTaskById(taskId);
            
            if (data.status === 'success') {
              
              stopPolling();
              set({ 
                activeTask: null, 
                taskResult: data.result,
                isPolling: false,
                isChecking: false
              });
              get().fetchBalance();
              
            } else if (data.status === 'failed') {
              stopPolling();
              set({ 
                activeTask: null, 
                taskResult: null,
                taskStatus: "failed",
                isPolling: false,
                isChecking: false
              });
              get().fetchBalance();
            } else if (data.status === 'processing') {
            
            }
          } catch (error) {
            console.error('Ошибка при поллинге:', error);
            // При ошибке не останавливаем поллинг, просто логируем
            set({ error: error.message });
          }
        };
        
        // Запускаем интервал
        const intervalId = setInterval(poll, 3000); // Каждые 3 секунды
        set({ pollingInterval: intervalId });
        
        // Сразу выполняем первый запрос
        poll();
      },
      
      // Остановка поллинга
      stopPolling: () => {
        const { pollingInterval } = get();
        
        if (pollingInterval) {
          clearInterval(pollingInterval);
          set({ 
            pollingInterval: null,
            isPolling: false 
          });
        }
      },
      
      // Сброс состояния (если нужно)
      reset: () => {
        const { stopPolling } = get();
        stopPolling();
        set({ 
          activeTask: null, 
          taskResult: null,
          isChecking: false,
          isPolling: false,
          error: null,
          message: null,
          taskStatus: null,
          tabType: "",
        });
      },
    }),
    { name: 'generation-store' }
  )
);

export default useGenerationStore;