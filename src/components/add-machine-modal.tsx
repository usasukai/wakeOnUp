"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@heroui/react";
import { useState } from "react";

interface AddMachineModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onAdd: (name: string, mac: string) => Promise<void>;
}

export function AddMachineModal({ isOpen, onOpenChange, onAdd }: AddMachineModalProps) {
  const [name, setName] = useState("");
  const [mac, setMac] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateMac = (mac: string): boolean => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
  };

  const handleSubmit = async (onClose: () => void) => {
    setError("");
    if (!name || !mac) {
      setError("名前とMACアドレスを入力してください");
      return;
    }

    if (!validateMac(mac)) {
      setError("MACアドレスの形式が正しくありません (例: 00:11:22:33:44:55)");
      return;
    }

    setIsLoading(true);
    try {
      await onAdd(name, mac);
      setName("");
      setMac("");
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "追加に失敗しました";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">マシンを追加</ModalHeader>
            <ModalBody>
              <Input
                autoFocus
                label="マシン名"
                placeholder="My Desktop"
                variant="bordered"
                value={name}
                onValueChange={setName}
              />
              <Input
                label="MACアドレス"
                placeholder="00:11:22:33:44:55"
                variant="bordered"
                value={mac}
                onValueChange={setMac}
              />
              {error && <p className="text-danger text-small">{error}</p>}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                キャンセル
              </Button>
              <Button color="primary" onPress={() => handleSubmit(onClose)} isLoading={isLoading}>
                追加
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
