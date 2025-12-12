import axios from 'axios'

const API = {
    async getHolders(symbol) {
        try {
            const r = await axios.get(`/api/holders/${symbol}`)
            if (!r?.data || !Array.isArray(r.data.holders)) {
                throw new Error('Risposta /api non valida')
            }
            return r.data
        } catch {
            const r2 = await axios.get(`/mocks/${symbol}.json`)
            return r2.data
        }
    }
}

export default API
