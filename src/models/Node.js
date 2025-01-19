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
        // Property change handler implementation...
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
        // Content editing setup implementation...
    }

    setupImagePaste() {
        // Image paste handling implementation...
    }

    setupDragging() {
        // Dragging functionality implementation...
    }

    setupResizing() {
        // Resizing functionality implementation...
    }

    updateStyles() {
        // Style updates implementation...
    }
}
