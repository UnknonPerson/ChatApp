
import api from '../../services/api'

export const fetchMessagesAPI = async ({
  conversationId,
  page = 1,
  limit = 20,
}) => {
  const { data } = await api.get(
    `/messages/${conversationId}`,
    {
      params: { page, limit },
    }
  )

  return data
}

export const sendMessageAPI = async ({
  conversationId,
  content,
}) => {
  const { data } = await api.post('/messages', {
    conversationId,
    content,
  })

  return data.data
}
