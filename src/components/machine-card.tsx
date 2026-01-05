"use client";

import { Card, CardHeader, CardFooter, Button, Divider } from "@heroui/react";
import { Machine } from "@/lib/storage";
import { useState } from "react";

interface MachineCardProps {
  machine: Machine;
  onWake: (mac: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function MachineCard({ machine, onWake, onDelete }: MachineCardProps) {
  const [isWaking, setIsWaking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleWake = async () => {
    setIsWaking(true);
    try {
      await onWake(machine.mac);
    } finally {
      setIsWaking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`「${machine.name}」を削除してもよろしいですか？`)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await onDelete(machine.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="max-w-[400px]">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-md font-bold">{machine.name}</p>
          <p className="text-small text-default-500">{machine.mac}</p>
        </div>
      </CardHeader>
      <Divider />
      <CardFooter className="flex justify-between gap-2">
        <Button 
          color="danger" 
          variant="light" 
          onPress={handleDelete}
          isLoading={isDeleting}
        >
          削除
        </Button>
        <Button 
          color="primary" 
          onPress={handleWake}
          isLoading={isWaking}
        >
          起動 (Wake)
        </Button>
      </CardFooter>
    </Card>
  );
}
