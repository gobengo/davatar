import * as React from "react";

export function NameEditor(props: {
  initialValue?: { name: string };
  onSave(entity: { name: string }): void;
}) {
  const { onSave } = props;
  const nameInputRef = React.useRef<null | HTMLInputElement>(null);
  const onSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const nameValue = nameInputRef.current?.value;
      if (typeof nameValue !== "string") {
        throw new Error("failed to determine name from input");
      }
      onSave({ name: nameValue });
    },
    [onSave]
  );
  return (
    <>
      <form onSubmit={onSubmit}>
        <input type="text" name="name" required ref={nameInputRef} />
        <input type="submit" value="save" />
      </form>
    </>
  );
}
