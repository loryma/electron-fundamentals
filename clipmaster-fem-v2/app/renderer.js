import React from 'react';
import { render } from 'react-dom';
import { clipboard, ipcRenderer } from 'electron';
import database from './database';

const writeToClipboard = content => {
    clipboard.writeText(content);
};

class Application extends React.Component {
    constructor() {
        super();
        this.state = {
            clippings: [
                {
                    content: 'lol',
                    id: 1,
                },
            ],
        };

        this.fetchClippings = this.fetchClippings.bind(this);
        this.addClipping = this.addClipping.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.handleWriteToClipboard = this.handleWriteToClipboard.bind(this);
    }

    componentDidMount() {
        this.fetchClippings();
        ipcRenderer.on('create-new-clipping', this.addClipping);
        ipcRenderer.on('write-to-clipboard', this.handleWriteToClipboard);
    }

    fetchClippings() {
        database('clippings')
            .select('')
            .then(clippings => this.setState({ clippings }));
    }

    addClipping() {
        const content = clipboard.readText();

        database('clippings').insert({ content }).then(this.fetchClippings);
    }

    handleWriteToClipboard() {
        const clipping = this.state.clippings[0];
        if (clipping) writeToClipboard(clipping.content);
    }

    handleRemove(id) {
        database('clippings').where('id', id).delete().then(this.fetchClippings);
    }

    render() {
        return (
            <div className='container'>
                <header className='controls'>
                    <button onClick={this.addClipping} id='copy-from-clipboard'>
                        Copy from Clipboard
                    </button>
                </header>

                <section className='content'>
                    <div className='clippings-list'>
                        {this.state.clippings.map(clipping => (
                            <Clipping
                                onRemove={this.handleRemove}
                                id={clipping.id}
                                key={clipping.id}
                                content={clipping.content}
                            />
                        ))}
                    </div>
                </section>
            </div>
        );
    }
}

const Clipping = ({ id, content, onRemove }) => {
    const remove = () => {
        console.log('remove', id);
        onRemove(id);
    };
    return (
        <article className='clippings-list-item'>
            <div className='clippings-text' disabled>
                {content}
            </div>
            <div className='clipping-controls'>
                <button onClick={() => writeToClipboard(content)}>&rarr; Clipboard</button>
                <button>Update</button>
                <button onClick={remove} className='remove-clipping'>
                    Remove
                </button>
            </div>
        </article>
    );
};

render(<Application />, document.getElementById('application'));
