import {
  prop,
} from '../lib/accessors';

describe('Accessors', () => {
  describe('"prop"', () => {
    describe('creates getters', () => {
      specify('for a property', () =>
        prop('hello').get({ hello: 'world' })
          .should.equal('world')
      );

      specify('for a deep property', () =>
        prop('hello', 'to').get({ hello: { to: 'the world' } })
          .should.equal('the world')
      );

      specify('for a very deep property', () =>
        prop('a', 'b', 'c').get({ a: { b: { c: 'yo' } } })
          .should.equal('yo')
      );

      specify('the getter can be a function of the value', () =>
        prop(x => x === 1).get({ a: {}, b: 1 }).should.equal(1)
      );

      specify('a deep getter can be a function of the value', () =>
        prop('t', x => x === 1).get({ t: { a: {}, b: 1 } }).should.equal(1)
      );
    });

    describe('creates setters', () => {
      specify('for a property', () =>
        prop('hello').set('world')()
          .should.deep.equal({ hello: 'world' })
      );
      specify('for a deep property', () =>
        prop('hello', 'to').set('the world')()
          .should.deep.equal({ hello: { to: 'the world' } })
      );
      specify('for a very deep property', () =>
        prop('a', 'b', 'c').set('yo')()
          .should.deep.equal({ a: { b: { c: 'yo' } } })
      );

      specify('the setter can be a function of the value', () =>
        prop(x => x === 1).set(2)({ a: {}, b: 1 })
        .should.deep.equal({ a: {}, b: 2 })
      );

      specify('a deep setter can be a function of the value', () =>
        prop('t', x => x === 1).set(2)({ t: { a: {}, b: 1 } })
        .should.deep.equal({ t: { a: {}, b: 2 } })
      );

      specify('setters preserve array structures', () =>
        prop(x => x === 1).set(2)([0, 1, 3])
        .should.deep.equal([0, 2, 3])
      );
    });

    describe('creates deleters', () => {
      specify('for a property', () =>
        prop('hello').delete({ hello: 'world', i: 'survived' })
          .should.deep.equal({ i: 'survived' })
      );

      specify('for a deep property', () =>
        prop('hello', 'to').delete({
          hello: { to: 'the world', i: 'survived' },
        }).should.deep.equal({
          hello: { i: 'survived' },
        })
      );

      specify('for a very deep property', () =>
        prop('a', 'b', 'c').delete({
          a: { b: { c: 'yo', i: 'survived' } },
        }).should.deep.equal({
          a: { b: { i: 'survived' } },
        })
      );

      specify('the deleter can be a function of the value', () =>
        prop(x => x === 1).delete({ a: {}, b: 1 })
        .should.deep.equal({ a: {} })
      );

      specify('a deep deleter can be a function of the value', () =>
        prop('t', x => x === 1).delete({ t: { a: {}, b: 1 } })
        .should.deep.equal({ t: { a: {} } })
      );

      specify('deleters preserve array structures', () =>
        prop(x => x === 1).delete([0, 1, 3])
        .should.deep.equal([0, 3])
      );
    });
  });
});
