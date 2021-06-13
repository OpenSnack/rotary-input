import RotaryInput from '../dist/rotary-input';

const input = new RotaryInput(
    document.body.querySelector('#root'),
    [
        { label: '0', value: '0' },
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
        { label: '5', value: '5' },
        { label: '6', value: '6' },
        { label: '7', value: '7' },
        { label: '8', value: '8' },
        { label: '9', value: '9' },
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' },
        { label: 'C', value: 'C' },
        { label: 'D', value: 'D' },
        { label: 'E', value: 'E' },
        { label: 'F', value: 'F' }
    ],
    {
        width: 500,
        height: 500
    }
);

input.onComplete(buffer => {
    const unicode = String.fromCharCode(parseInt(buffer.join(''), 16));
    document.querySelector<HTMLInputElement>('input#output').value += unicode;
});

input.onBack(() => {
    const inputValue = document.querySelector<HTMLInputElement>('input#output').value;
    document.querySelector<HTMLInputElement>('input#output').value = inputValue.slice(0, -1);
})
