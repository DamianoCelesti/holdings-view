import axios from "axios";

const api = {
    async getAllEvents() {
        const r = await axios.get("/mocks/live/ALL.json", {
            headers: { "Cache-Control": "no-cache" }
        });
        return r.data;
    }
};

export default api;