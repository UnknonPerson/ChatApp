
import api from '../../services/api'

export const getConversations = async () => {
  const { data } = await api.get('/conversations')
  return data.conversations
}
