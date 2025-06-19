export default async function UserProfilePage({
  params,
}: {params: Promise<{ name: string }>}) {
  const { name } = await params
  return <div>Hello {name}</div>
}