import { connection } from 'next/server'

export const runtime = 'edge'

function throwError() {
  throw new Error('Boom')
}

export default async function Page() {
  await connection()
  throwError()
  return null
}
