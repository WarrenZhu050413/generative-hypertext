/**
 * General Test Helper Utilities
 *
 * Common utilities for waiting, element queries, and assertions in tests.
 */

/**
 * Wait for a specific element to appear in the DOM
 *
 * @param selector - CSS selector for the element
 * @param timeout - Maximum time to wait in milliseconds
 * @returns Promise resolving to the element
 *
 * @example
 * const button = await waitForElement('.submit-button', 5000);
 * button.click();
 */
export async function waitForElement(
  selector: string,
  timeout: number = 5000
): Promise<HTMLElement> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const element = document.querySelector(selector) as HTMLElement;

      if (element) {
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for element: ${selector}`));
      } else {
        setTimeout(check, 100);
      }
    };

    check();
  });
}

/**
 * Wait for multiple elements to appear in the DOM
 *
 * @param selector - CSS selector for the elements
 * @param count - Expected number of elements
 * @param timeout - Maximum time to wait in milliseconds
 * @returns Promise resolving to the elements
 */
export async function waitForElements(
  selector: string,
  count: number,
  timeout: number = 5000
): Promise<HTMLElement[]> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];

      if (elements.length >= count) {
        resolve(elements.slice(0, count));
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for ${count} elements: ${selector}`));
      } else {
        setTimeout(check, 100);
      }
    };

    check();
  });
}

/**
 * Wait for an element to be removed from the DOM
 *
 * @param selector - CSS selector for the element
 * @param timeout - Maximum time to wait in milliseconds
 */
export async function waitForElementRemoval(
  selector: string,
  timeout: number = 5000
): Promise<void> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const element = document.querySelector(selector);

      if (!element) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for element removal: ${selector}`));
      } else {
        setTimeout(check, 100);
      }
    };

    check();
  });
}

/**
 * Wait for a condition to be true
 *
 * @param condition - Function that returns true when condition is met
 * @param timeout - Maximum time to wait in milliseconds
 * @param interval - Check interval in milliseconds
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, interval);
      }
    };

    check();
  });
}

/**
 * Simulate a delay
 *
 * @param ms - Milliseconds to delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Trigger a custom event on an element
 *
 * @param element - Target element
 * @param eventName - Name of the event
 * @param detail - Event detail data
 */
export function triggerEvent(
  element: HTMLElement,
  eventName: string,
  detail?: any
): void {
  const event = new CustomEvent(eventName, {
    bubbles: true,
    cancelable: true,
    detail,
  });
  element.dispatchEvent(event);
}

/**
 * Simulate mouse hover on an element
 *
 * @param element - Target element
 */
export function simulateHover(element: HTMLElement): void {
  const mouseEnterEvent = new MouseEvent('mouseenter', {
    bubbles: true,
    cancelable: true,
  });
  const mouseOverEvent = new MouseEvent('mouseover', {
    bubbles: true,
    cancelable: true,
  });

  element.dispatchEvent(mouseEnterEvent);
  element.dispatchEvent(mouseOverEvent);
}

/**
 * Simulate mouse click on an element
 *
 * @param element - Target element
 */
export function simulateClick(element: HTMLElement): void {
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(clickEvent);
}

/**
 * Simulate keyboard input on an element
 *
 * @param element - Target element (input or contenteditable)
 * @param text - Text to input
 */
export function simulateInput(element: HTMLInputElement | HTMLTextAreaElement, text: string): void {
  element.value = text;

  const inputEvent = new Event('input', {
    bubbles: true,
    cancelable: true,
  });

  element.dispatchEvent(inputEvent);
}

/**
 * Simulate keyboard key press
 *
 * @param element - Target element
 * @param key - Key to press (e.g., 'Enter', 'Escape')
 * @param options - Additional key event options
 */
export function simulateKeyPress(
  element: HTMLElement,
  key: string,
  options?: Partial<KeyboardEventInit>
): void {
  const keyDownEvent = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });

  const keyUpEvent = new KeyboardEvent('keyup', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });

  element.dispatchEvent(keyDownEvent);
  element.dispatchEvent(keyUpEvent);
}

/**
 * Get computed styles for an element
 *
 * @param element - Target element
 * @param properties - CSS properties to retrieve
 * @returns Object with computed style values
 */
export function getComputedStyles(
  element: HTMLElement,
  properties: string[]
): Record<string, string> {
  const styles = window.getComputedStyle(element);
  const result: Record<string, string> = {};

  properties.forEach(prop => {
    result[prop] = styles.getPropertyValue(prop);
  });

  return result;
}

/**
 * Check if an element is visible (in viewport and not hidden)
 *
 * @param element - Element to check
 * @returns True if element is visible
 */
export function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    parseFloat(style.opacity) > 0
  );
}

/**
 * Scroll element into view
 *
 * @param element - Element to scroll to
 */
export function scrollIntoView(element: HTMLElement): void {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'center',
  });
}

/**
 * Create a mock File object
 *
 * @param name - File name
 * @param content - File content
 * @param type - MIME type
 */
export function createMockFile(
  name: string,
  content: string,
  type: string = 'text/plain'
): File {
  return new File([content], name, { type });
}

/**
 * Create a mock DataTransfer object for drag and drop
 *
 * @param files - Files to include
 */
export function createMockDataTransfer(files?: File[]): DataTransfer {
  const dataTransfer = new DataTransfer();

  if (files) {
    files.forEach(file => {
      dataTransfer.items.add(file);
    });
  }

  return dataTransfer;
}

/**
 * Measure execution time of a function
 *
 * @param fn - Function to measure
 * @returns Execution time in milliseconds
 */
export async function measureExecutionTime(fn: () => Promise<void> | void): Promise<number> {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
}

/**
 * Create a promise that rejects after a timeout
 *
 * @param ms - Timeout in milliseconds
 * @param message - Error message
 */
export function timeout(ms: number, message: string = 'Operation timed out'): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

/**
 * Race a promise against a timeout
 *
 * @param promise - Promise to race
 * @param ms - Timeout in milliseconds
 * @param message - Timeout error message
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message?: string
): Promise<T> {
  return Promise.race([promise, timeout(ms, message)]);
}