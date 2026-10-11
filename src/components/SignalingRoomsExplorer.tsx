import React from "react";
import { SignalingRoomRacksMap } from "./signaling/SignalingRoomRacksMap";

interface SignalingRoomsExplorerProps {
  onSelectStationInSimulator?: (stationId: number) => void;
  initialRoomId?: string;
}

/**
 * SignalingRoomsExplorer delegates directly to the comprehensive SignalingRoomRacksMap
 * that provides clean, single-page, non-modal 42U rack elevations, subrack inspections,
 * and industrial network protocol architectures based on Maharan & FIEC engineering manuals.
 */
export const SignalingRoomsExplorer: React.FC<SignalingRoomsExplorerProps> = ({
  onSelectStationInSimulator,
  initialRoomId = "CER-OCC",
}) => {
  return (
    <SignalingRoomRacksMap
      initialRoomId={initialRoomId}
      onSelectStationInSimulator={onSelectStationInSimulator}
    />
  );
};
