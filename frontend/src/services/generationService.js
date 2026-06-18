import api from "../api/axiosInstance";
import bridge from "@vkontakte/vk-bridge";
export const generationService = {
  checkTasks: async () => {
    const launchParams = await bridge.send('VKWebAppGetLaunchParams');
    const response = await api.get('/generator/tasks', {
      headers: {
        "Content-Type": "application/json",
        "X-VK-Launch-Params": JSON.stringify(launchParams),
      }
    });
    return response.data;
  },
  
  getTaskById: async (taskId) => {
    const launchParams = await bridge.send('VKWebAppGetLaunchParams');
    const response = await api.get(`/generator/tasks/${taskId}`, {
      headers: {
        "Content-Type": "application/json",
        "X-VK-Launch-Params": JSON.stringify(launchParams),
      }
    });
    return response.data;
  },

  getGenerationHistory: async (type) => {
    const launchParams = await bridge.send('VKWebAppGetLaunchParams');
    const response = await api.get(`/generator/history`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-VK-Launch-Params": JSON.stringify(launchParams),
        },
        params: {
          task_type: type
        }
      }
    );
    return response.data;
  },

  generateContent: async (type, payload) => {
    const launchParams = await bridge.send('VKWebAppGetLaunchParams');

    const formData = new FormData();

    formData.append("type", type);
    formData.append("prompt", payload.prompt);

    if (payload.image) {
      formData.append("reference_image", payload.image);
    }

    if (payload.aspectRatio !== null && payload.aspectRatio !== undefined) {
      formData.append("aspect_ratio", payload.aspectRatio);
    }

    const response = await api.post(
      "/generator/generate", 
      formData,
      {
        headers: {
          "X-VK-Launch-Params": JSON.stringify(launchParams),
        },
      });
    return response.data;
  },

  getBalance: async () => {
    const launchParams = await bridge.send('VKWebAppGetLaunchParams');
    const response = await api.get("/generator/balance", {
      headers: {
        "Content-Type": "application/json",
        "X-VK-Launch-Params": JSON.stringify(launchParams),
      }
    });
    return response.data;
  },

  getCosts: async () => {
    const launchParams = await bridge.send('VKWebAppGetLaunchParams');
    const response = await api.get("/generator/costs", {
      headers: {
        "Content-Type": "application/json",
        "X-VK-Launch-Params": JSON.stringify(launchParams),
      }
    });
    return response.data;
  }
};
