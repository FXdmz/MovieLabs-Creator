import React, { useRef, useEffect, useState } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface JsonEditorProps {
  value: any;
  onChange: (value: any) => void;
  schema?: any;
}

export function JsonEditor({ value, onChange, schema }: JsonEditorProps) {
  const monaco = useMonaco();
  const [errors, setErrors] = useState<any[]>([]);

  useEffect(() => {
    if (monaco && schema) {
      // @ts-ignore - Monaco types are sometimes tricky with jsonDefaults
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
          {
            uri: "https://movielabs.com/omc/json/schema/v2.6",
            fileMatch: ["*"],
            schema: schema,
          },
        ],
      });
    }
  }, [monaco, schema]);

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    try {
      const parsed = JSON.parse(value);
      onChange(parsed);
      setErrors([]);
    } catch (e) {
      // Don't update parent if JSON is invalid, but maybe show error
    }
  };

  return (
    <div className="h-full w-full rounded-md overflow-hidden border border-border bg-card">
      <Editor
        height="100%"
        defaultLanguage="json"
        value={JSON.stringify(value, null, 2)}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          automaticLayout: true,
        }}
      />
    </div>
  );
}
