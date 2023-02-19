import { createPropertyExpression } from '../expression';
import definitions from './definitions';
import v8 from '../reference/v8.json' assert { type: 'json' };
// filter out interal "error" and "filter-*" expressions from definition list
const filterExpressionRegex = /filter-/;
const definitionList = Object.keys(definitions).filter((expression) => {
    return expression !== 'error' && !filterExpressionRegex.exec(expression);
}).sort();
describe('v8.json includes all definitions from style-spec', () => {
    const v8List = Object.keys(v8.expression_name.values);
    const v8SupportedList = v8List.filter((expression) => {
        //filter out expressions that are not supported in GL-JS
        return !!v8.expression_name.values[expression]['sdk-support']['basic functionality']['js'];
    });
    expect(definitionList).toEqual(v8SupportedList.sort());
});
describe('createPropertyExpression', () => {
    test('prohibits non-interpolable properties from using an "interpolate" expression', () => {
        const { result, value } = createPropertyExpression([
            'interpolate', ['linear'], ['zoom'], 0, 0, 10, 10
        ], {
            type: 'number',
            'property-type': 'data-constant',
            expression: {
                'interpolated': false,
                'parameters': ['zoom']
            }
        });
        expect(result).toBe('error');
        expect(value).toHaveLength(1);
        expect(value[0].message).toBe('"interpolate" expressions cannot be used with this property');
    });
});
describe('evaluate expression', () => {
    test('warns and falls back to default for invalid enum values', () => {
        const { value } = createPropertyExpression(['get', 'x'], {
            type: 'enum',
            values: { a: {}, b: {}, c: {} },
            default: 'a',
            'property-type': 'data-driven',
            expression: {
                'interpolated': false,
                'parameters': ['zoom', 'feature']
            }
        });
        jest.spyOn(console, 'warn').mockImplementation(() => { });
        expect(value.kind).toBe('source');
        expect(value.evaluate({}, { properties: { x: 'b' } })).toBe('b');
        expect(value.evaluate({}, { properties: { x: 'invalid' } })).toBe('a');
        expect(console.warn).toHaveBeenCalledWith('Expected value to be one of "a", "b", "c", but found "invalid" instead.');
    });
});
//# sourceMappingURL=expression.test.js.map