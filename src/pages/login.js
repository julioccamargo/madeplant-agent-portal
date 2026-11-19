export function renderLogin(main) {
  main.innerHTML = `
    <div class="login-card">
      <h2>Entrar</h2>
      <p id="loginHint" class="muted">Lab: use proxy Dokploy ou informe nome para auditoria local.</p>
      <form id="loginForm">
        <label>Nome exibido <input id="loginName" placeholder="Admin lab" /></label>
        <button type="submit" class="primary">Entrar</button>
      </form>
    </div>
  `;
}