"use client";

import { useEffect, useState, useCallback } from "react";
import { Button, Navbar, NavbarBrand, NavbarContent, NavbarItem, useDisclosure, Spinner } from "@heroui/react";
import { MachineCard } from "@/components/machine-card";
import { AddMachineModal } from "@/components/add-machine-modal";
import { Machine } from "@/lib/storage";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

export default function Home() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isMacElectron, setIsMacElectron] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isElectron = ua.includes("Electron");
    const isMac = ua.includes("Macintosh") || (navigator.platform || "").startsWith("Mac");
    setIsMacElectron(isElectron && isMac);
  }, []);

  const fetchMachines = useCallback(async () => {
    try {
      const data = await apiClient.getMachines();
      setMachines(data);
    } catch (error) {
      console.error('Failed to fetch machines:', error);
      toast.error("マシンの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  const handleWake = async (mac: string) => {
    try {
      await apiClient.wake(mac);
      toast.success(`起動信号を送信しました: ${mac}`);
    } catch (error) {
      console.error('Failed to wake machine:', error);
      toast.error("起動信号の送信に失敗しました");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteMachine(id);
      setMachines(machines.filter(m => m.id !== id));
      toast.success("マシンを削除しました");
    } catch (error) {
      console.error('Failed to delete machine:', error);
      toast.error("削除に失敗しました");
    }
  };

  const handleAdd = async (name: string, mac: string) => {
    try {
      const newMachine = await apiClient.addMachine(name, mac);
      setMachines([...machines, newMachine]);
      toast.success("マシンを追加しました");
    } catch (error) {
      const message = error instanceof Error ? error.message : "追加に失敗しました";
      toast.error(message);
      throw error; // Re-throw for modal to handle
    }
  };

  return (
    <div className={`min-h-screen bg-background text-foreground ${isMacElectron ? 'pt-8' : ''}`}>
      <Navbar isBordered className={isMacElectron ? 'pl-14' : undefined}>
        <NavbarBrand>
          <p className="font-bold text-inherit">WakeOnLan Web</p>
        </NavbarBrand>
        <NavbarContent justify="end">
          <NavbarItem>
            <Button color="primary" variant="flat" onPress={onOpen}>
              マシン追加
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <main className="container mx-auto p-4 pt-8">
        {loading ? (
          <div className="flex justify-center mt-20">
            <Spinner size="lg" />
          </div>
        ) : machines.length === 0 ? (
          <div className="text-center mt-20 text-default-500">
            <p>保存されたマシンがありません。</p>
            <p>右上の「マシン追加」ボタンから登録してください。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {machines.map((machine) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                onWake={handleWake}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      <AddMachineModal isOpen={isOpen} onOpenChange={onOpenChange} onAdd={handleAdd} />
    </div>
  );
}