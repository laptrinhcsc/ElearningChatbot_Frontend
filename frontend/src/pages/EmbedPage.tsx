import React from 'react';
import { useSearchParams } from 'react-router-dom';
import EmbeddableChat from '../components/EmbeddableChat';

const EmbedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const topic = searchParams.get('topic') || 'general';
  const apiUrl = searchParams.get('apiUrl') || undefined;
  const height = searchParams.get('height') || undefined;
  const width = searchParams.get('width') || undefined;

  return (
    <EmbeddableChat
      topic={topic}
      apiUrl={apiUrl}
      height={height}
      width={width}
    />
  );
};

export default EmbedPage; 