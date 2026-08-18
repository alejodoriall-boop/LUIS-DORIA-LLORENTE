/**
 * Safe printing and window opening utilities for sandboxed iframe environments.
 */

export const safePrint = (): void => {
  try {
    if (typeof window !== 'undefined') {
      window.print();
    }
  } catch (err) {
    console.warn('Printing is restricted in this iframe environment:', err);
  }
};

export const safeConfirm = (message: string): boolean => {
  try {
    if (typeof window !== 'undefined' && window.confirm) {
      return window.confirm(message);
    }
  } catch (err) {
    console.warn('Confirm restricted in this environment:', err);
  }
  return true;
};

export const safeOpenURL = (url: string, target = '_blank'): void => {
  try {
    if (typeof window !== 'undefined') {
      const a = document.createElement('a');
      a.href = url;
      a.target = target;
      a.rel = 'noopener noreferrer';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try {
          document.body.removeChild(a);
        } catch {
          // ignore
        }
      }, 100);
    }
  } catch (err) {
    console.warn('Opening window restricted in this iframe environment:', err);
  }
};

export const printHTML = (htmlContent: string): void => {
  try {
    let printContainer = document.getElementById('print-mount-point');
    if (!printContainer) {
      printContainer = document.createElement('div');
      printContainer.id = 'print-mount-point';
      printContainer.className = 'print-only-container';
      document.body.appendChild(printContainer);
    }

    printContainer.innerHTML = htmlContent;

    setTimeout(() => {
      safePrint();
    }, 150);
  } catch (e) {
    console.warn('Print HTML error:', e);
    safePrint();
  }
};
