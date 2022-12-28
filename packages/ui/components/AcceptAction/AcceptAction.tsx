import { ActionIcon, CheckIcon } from '@mantine/core';

type AcceptActionProps = {
  onAccept: () => void;
  disabled: boolean;
  ariaLabel: string;
};
const AcceptAction = ({ onAccept, disabled, ariaLabel }: AcceptActionProps) => {
  return (
    <ActionIcon
      size="xs"
      onClick={onAccept}
      disabled={disabled}
      variant="transparent"
      color="green"
      aria-label={ariaLabel}
    >
      <CheckIcon width="100%" height="100%" />
    </ActionIcon>
  );
};

export default AcceptAction;
