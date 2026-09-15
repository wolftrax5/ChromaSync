import { Room } from "@/components/Room";
import { RoomBoard } from "@/components/RoomBoard";

type RoomPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RoomPage({ params }: RoomPageProps) {
  const { id } = await params;

  return (
    <Room roomId={id}>
      <RoomBoard roomId={id} />
    </Room>
  );
}
