import toast from 'react-hot-toast';

export const copyToClipboard = async (text: string, successMessage: string = 'Copied to clipboard!'): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // Use modern clipboard API
      await navigator.clipboard.writeText(text);
      toast.success(successMessage, {
        icon: '📋',
        duration: 2000,
      });
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      textArea.remove();
      
      if (successful) {
        toast.success(successMessage, {
          icon: '📋',
          duration: 2000,
        });
        return true;
      } else {
        throw new Error('Copy command failed');
      }
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    toast.error('Failed to copy to clipboard');
    return false;
  }
};

