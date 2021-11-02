import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import Modal from '../components/Modal/Modal';

type ModalData = {
  title?: string;
  children: ReactNode;
  fitContent?: boolean;
};
type ModalContextProps = {
  modals: ModalData[];
  addModal: (modal: ModalData) => void;
  closeLatestModal: () => void;
};
const ModalContext = createContext<ModalContextProps>({
  modals: [],
  addModal: () => undefined,
  closeLatestModal: () => undefined,
});

type ModalProviderProps = {
  children: ReactNode;
};

export function ModalProvider({ children }: ModalProviderProps): JSX.Element {
  const [modals, setModals] = useState<ModalData[]>([]);

  function addModal(modal: ModalData) {
    setModals((modals) => [...(modals || []), modal]);
  }

  function handleClose() {
    setModals((modals) => {
      const newModals = [...modals];
      newModals.pop();
      return newModals;
    });
  }

  return (
    <ModalContext.Provider
      value={{ modals, addModal, closeLatestModal: handleClose }}
    >
      {children}
      {modals.map((modal, index) => (
        <Modal
          key={`${modal.title || 'unknown'}-${index}`}
          title={modal.title}
          onClose={handleClose}
          fitContent={modal.fitContent}
        >
          {modal.children}
        </Modal>
      ))}
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextProps {
  return useContext(ModalContext);
}
