import Button from '../Button/Button';
import styles from './ReportIssue.module.css';
import { postComment } from './api';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { writeError } from '../../utils/logs';
import { useAccount } from '../../contexts/UserContext';
import { notify } from '../../utils/notifications';
import { useMarkers } from '../../contexts/MarkersContext';

type ReportIssueProps = {
  markerId: string;
  onAdd: () => void;
};
function ReportIssue({ markerId, onAdd }: ReportIssueProps): JSX.Element {
  const { account } = useAccount();
  const [message, setMessage] = useState('');
  const { refresh: refreshMarkers } = useMarkers();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event?: FormEvent) {
    if (event) {
      event.preventDefault();
    }
    if (!account) {
      return;
    }
    if (!message.trim()) {
      return;
    }

    try {
      setLoading(true);
      await notify(postComment(markerId, { message, isIssue: true }));
      onAdd();
      setMessage('');
      refreshMarkers();
    } catch (error) {
      writeError(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        autoFocus
        placeholder="What is wrong with this node?"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <Button type="submit" disabled={loading}>
        Report issue
      </Button>
    </form>
  );
}

export default ReportIssue;
