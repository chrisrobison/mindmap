// src/models/Node.js
import { createBindings } from '../utils/bindings';
import { DOMUtils } from '../utils/dom';

export class Node {
    constructor(id, x, y, title = 'New Node', options = {}) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.title = title;
        this.html = options.html || '';
        this.cssClass = options.cssClass || '';
        this.images = [];
        
        this.styles = {
            backgroundColor: '#ffffff',
            color: '#000000',
            fontFamily: 'Lexend',
            fontSize: '16px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#cccccc',
            borderRadius: '5px',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.1)'
        };

        this.width = options.width || 150;
        this.height = options.height || 100;

        this.properties = createBindings({
            id, x, y, title,
            width: this.width,
            height: this.height,
            styles: this.styles
        }, (prop, value) => this.handlePropertyChange(prop, value));

        this.element = null;
        this.render();
        this.setupContentEditing();
        this.setupImagePaste();
        this.setupDragging();
        this.setupResizing();
    }

    handlePropertyChange(prop, value) {
        // Handle property changes and update UI
        if (this.element) {
            if (prop === 'x') {
                this.element.style.left = `${value}px`;
            } else if (prop === 'y') {
                this.element.style.top = `${value}px`;
            } else if (prop === 'title') {
                const header = this.element.querySelector('.node-header');
                if (header) header.textContent = value;
            } else if (prop === 'width') {
                this.element.style.width = `${value}px`;
            } else if (prop === 'height') {
                this.element.style.height = `${value}px`;
            } else if (prop.startsWith('styles.')) {
                this.updateStyles();
            }
            app.updateConnections();
            app.saveState();
        }
    }

    render() {
        if (!this.element) {
            this.element = DOMUtils.createElement('div', `mindmap-node ${this.cssClass}`, {
                'data-id': this.id
            });

            const header = DOMUtils.createElement('div', 'node-header', {
                contentEditable: 'true',
                spellcheck: 'false'
            });
            header.textContent = this.title;

            const content = DOMUtils.createElement('div', 'node-content', {
                contentEditable: 'true',
                spellcheck: 'false'
            });
            content.innerHTML = this.html;

            const deleteBtn = DOMUtils.createElement('div', 'node-delete');
            deleteBtn.innerHTML = '×';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onDelete?.(this.id);
            });

            this.element.appendChild(header);
            this.element.appendChild(content);
            this.element.appendChild(deleteBtn);
        }

        this.updateStyles();
        return this.element;
    }

    setupContentEditing() {
        const content = this.element.querySelector('.node-content');
        content.addEventListener('input', () => {
            this.html = content.innerHTML;
            app.saveState();
        });

        content.addEventListener('blur', () => {
            this.html = content.innerHTML;
            app.saveState();
        });

        const header = this.element.querySelector('.node-header');
        header.addEventListener('input', () => {
            this.title = header.textContent;
            app.saveState();
        });

        header.addEventListener('blur', () => {
            this.title = header.textContent;
            app.saveState();
        });
    }

    setupImagePaste() {
        const content = this.element.querySelector('.node-content');
        content.addEventListener('paste', async (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (!item.type.startsWith('image/')) continue;

                e.preventDefault();
                const file = item.getAsFile();
                let dataurl, reader;
                if (file.type === "image/gif") {
                    reader = new FileReader();
                    reader.onload = (e) => {
                        dataurl = reader.result;
                        this.addImage(dataurl);
                    };
                    reader.readAsDataURL(file);
                } else {
                    // Only process through canvas if it's not a GIF
                    try {
                        const img = new Image();
                        img.src = reader.result;
                        await new Promise(resolve => img.onload = resolve);

                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        dataurl = canvas.toDataURL(item.type);
                        this.addImage(dataurl);
                    } catch (err) {
                        console.error('Error processing image:', err);
                        // Fallback to using the direct FileReader result
                        reader = new FileReader();
                        reader.onload = (e) => {
                            dataurl = reader.result;
                            this.addImage(dataurl);
                        }
                        
                        reader.readAsDataURL(file);
                    }
                }
                // Only process the first image found
                break;
            }
        });
   }
    getStyleString() {
        return `
            background-color: ${this.styles.backgroundColor};
            color: ${this.styles.color};
            font-family: ${this.styles.fontFamily};
            font-size: ${this.styles.fontSize};
            border-width: ${this.styles.borderWidth};
            border-style: ${this.styles.borderStyle};
            border-color: ${this.styles.borderColor};
            border-radius: ${this.styles.borderRadius};
            box-shadow: ${this.styles.boxShadow};
        `;
    }

    addImage(dataurl) {
        const content = this.element.querySelector('.node-content');
        if (dataurl) { 
            // Create and insert image at cursor position
            const imgElement = document.createElement('img');
            imgElement.src = dataurl;
            imgElement.style.maxWidth = '100%';
            
            // Ensure we're inserting at the cursor position if there is one
            const selection = window.getSelection();
            if (selection.rangeCount > 0 && selection.getRangeAt(0).commonAncestorContainer.closest('.node-content') === content) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(imgElement);
            } else {
                content.appendChild(imgElement);
            }

            // Add a line break after the image for better editing
            const br = document.createElement('br');
            imgElement.after(br);

            this.images.push(dataurl);
            app.saveState();
        }


    }


    setupDragging() {
        const header = this.element.querySelector('.node-header');
        let isDragging = false;
        let isConnecting = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let tempLine = null;

        const createTempLine = (x1, y1, x2, y2) => {
            const svg = document.querySelector('.connections');
            tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tempLine.setAttribute('x1', x1);
            tempLine.setAttribute('y1', y1);
            tempLine.setAttribute('x2', x2);
            tempLine.setAttribute('y2', y2);
            tempLine.setAttribute('stroke', 'var(--primary-color)');
            tempLine.setAttribute('stroke-width', '2');
            tempLine.classList.add('temp-connection');
            svg.appendChild(tempLine);
            return tempLine;
        };

        const updateTempLine = (x2, y2) => {
            if (tempLine) {
                tempLine.setAttribute('x2', x2);
                tempLine.setAttribute('y2', y2);
            }
        };

        const removeTempLine = () => {
            if (tempLine) {
                tempLine.remove();
                tempLine = null;
            }
        };

        header.addEventListener('mousedown', (e) => {
            if (e.ctrlKey) {
                isConnecting = true;
                const rect = this.element.getBoundingClientRect();
                const startX = rect.left + rect.width / 2;
                const startY = rect.top + rect.height / 2;
                createTempLine(startX, startY, e.clientX, e.clientY);
            } else {
                isDragging = true;
                initialX = e.clientX - this.x;
                initialY = e.clientY - this.y;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isConnecting) {
                updateTempLine(e.clientX, e.clientY);
            } else if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                this.x = currentX;
                this.y = currentY;
                this.element.style.left = `${this.x}px`;
                this.element.style.top = `${this.y}px`;
                document.querySelector("#nodeX").value = currentX;
                document.querySelector("#nodeY").value = currentY;

                app.updateConnections();
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (isConnecting) {
                const targetNode = app.findNodeAtPosition(e.clientX, e.clientY);
                if (targetNode && targetNode.id !== this.id) {
                    app.createConnection(this.id, targetNode.id);
                }
                removeTempLine();
                isConnecting = false;
            }
            if (isDragging) {
                isDragging = false;
                app.saveState();
            }
        });
    }

    setupResizing() {
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                this.width = entry.contentRect.width;
                this.height = entry.contentRect.height;
                app.updateConnections();
                app.saveState();
            }
        });
        observer.observe(this.element);
   }

    updateStyles() {
        if (this.element) {
            Object.entries(this.properties.styles).forEach(([key, value]) => {
                this.element.style[key] = value;
            });
        }
    }
}
