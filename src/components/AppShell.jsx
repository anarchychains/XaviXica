export default function AppShell({ children }) {
  return (
    <div style={{ minHeight: "100vh", padding: 24, background: "#f6f7fb" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}
