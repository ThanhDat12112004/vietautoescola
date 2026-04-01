export const ADMIN_REDESIGN_CSS = `
  .admin-redesign {
    font-family: 'Be Vietnam Pro', ui-sans-serif, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .admin-redesign input,
  .admin-redesign textarea,
  .admin-redesign select {
    border-radius: 0.6rem;
    border-color: rgba(122, 32, 56, 0.24);
    background: #ffffff;
  }

  .admin-redesign button {
    letter-spacing: 0.005em;
    transition: all 0.18s ease;
  }

  .admin-redesign button[type='submit'] {
    min-height: 2.5rem;
    padding-inline: 1rem;
    border-radius: 0.65rem;
    font-weight: 700;
    box-shadow: 0 8px 18px rgba(122, 32, 56, 0.16);
  }

  .admin-redesign .admin-row-actions button {
    opacity: 0.82;
  }
  .admin-redesign .group:hover .admin-row-actions button {
    opacity: 1;
  }

  .admin-redesign .admin-btn-edit {
    border: 1px solid #cfa6b1;
    background: #fff6f8;
    color: #5a1428;
  }
  .admin-redesign .admin-btn-edit:hover {
    background: #fdecef;
    border-color: #c392a0;
  }

  .admin-redesign .admin-btn-delete {
    border: 1px solid #ef9aa8;
    background: #fff6f7;
    color: #b42318;
  }
  .admin-redesign .admin-btn-delete:hover {
    background: #ffecee;
    border-color: #e47b8d;
    color: #9d1c12;
  }

  .admin-redesign .rounded-sm {
    border-radius: 0.5rem;
  }

  .admin-redesign .bg-white {
    background: rgba(255, 255, 255, 0.96);
  }

  .admin-redesign .shadow-sm {
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  }

  .admin-redesign .border {
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
  }

  .admin-redesign .border:hover {
    border-color: rgba(122, 32, 56, 0.38);
  }

  .admin-redesign input:focus,
  .admin-redesign textarea:focus,
  .admin-redesign button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(122, 32, 56, 0.16);
  }

  .admin-surface-view {
    border: 1px solid rgba(122, 32, 56, 0.28);
    background: linear-gradient(135deg, rgba(255, 247, 250, 0.96) 0%, rgba(255, 255, 255, 0.98) 100%);
    box-shadow: inset 3px 0 0 0 #7a2038;
  }
  .admin-surface-edit {
    border: 1px solid rgba(244, 114, 182, 0.4);
    background: linear-gradient(135deg, rgba(253, 242, 248, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
    box-shadow: inset 3px 0 0 0 #ec4899;
  }
`;
