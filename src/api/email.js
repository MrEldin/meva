import client from '@/api/client'

/**
 * The e-mail campaign endpoints.
 *
 * Gathered here rather than spread across the views because the editor and the
 * campaign list talk to the same handful of routes, and because the preview
 * call is unusual: it asks for HTML, not JSON.
 */
const base = '/admin/marketing/email'

export const library = () => client.get(`${base}/library`).then((r) => r.data.data)

export const listCampaigns = (params) => client.get(`${base}/campaigns`, { params }).then((r) => r.data)

export const createCampaign = (payload) => client.post(`${base}/campaigns`, payload).then((r) => r.data.data)

export const getCampaign = (id) => client.get(`${base}/campaigns/${id}`).then((r) => r.data.data)

export const saveCampaign = (id, payload) => client.put(`${base}/campaigns/${id}`, payload).then((r) => r.data.data)

export const deleteCampaign = (id) => client.delete(`${base}/campaigns/${id}`)

export const audienceFor = (id, audience) =>
  client.get(`${base}/campaigns/${id}/audience`, { params: { audience } }).then((r) => r.data.data)

export const sendTest = (id, email) => client.post(`${base}/campaigns/${id}/test`, { email }).then((r) => r.data.data)

export const sendCampaign = (id) => client.post(`${base}/campaigns/${id}/send`).then((r) => r.data.data)

/**
 * The rendered message, as HTML.
 *
 * The blocks currently on screen are posted rather than read from the saved
 * copy, so the preview follows typing. The server answers with the same markup
 * it would put in the envelope.
 */
export const previewCampaign = (id, payload) =>
  client
    .post(`${base}/campaigns/${id}/preview`, payload, { headers: { Accept: 'text/html' }, responseType: 'text' })
    .then((r) => r.data)
