import sanityClient from '@sanity/client'
import { api } from '../../studio/sanity.json'
const { projectId, dataset, apiVersion } = api

const client = sanityClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true
})

export default client