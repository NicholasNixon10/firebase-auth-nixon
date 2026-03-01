'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { useEffect, useState } from 'react';

export default function DocsPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch('/api/docs')
      .then(res => res.json())
      .then(setSpec);
  }, []);

  if (!spec) return <div>Loading...</div>;

  return <SwaggerUI spec={spec} />;
}