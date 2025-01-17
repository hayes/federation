import { execute } from '../execution-utils';
import { astSerializer, queryPlanSerializer } from 'apollo-federation-integration-testsuite';

expect.addSnapshotSerializer(astSerializer);
expect.addSnapshotSerializer(queryPlanSerializer);

// TODO: right now the query planner doesn't prune known skip and include points
// eventually we want to do this to prevent downstream fetches that aren't needed
describe('@skip', () => {
  it('supports @skip when a boolean condition is met', async () => {
    const query = `#graphql
      query GetReviewers {
        topReviews {
          body
          author @skip(if: true) {
            name {
              first
            }
          }
        }
      }
    `;

    const { data, queryPlan } = await execute({
      query,
    });

    expect(data).toEqual({
      topReviews: [
        { body: 'Love it!' },
        { body: 'Too expensive.' },
        { body: 'Could be better.' },
        { body: 'Prefer something else.' },
        { body: 'Wish I had read this before.' },
      ],
    });

    expect(queryPlan).toCallService('accounts');
    expect(queryPlan).toCallService('reviews');
  });

  it('supports @skip when a boolean condition is met (variable driven)', async () => {
    const query = `#graphql
      query GetReviewers($skip: Boolean!) {
        topReviews {
          body
          author @skip(if: $skip) {
            username
          }
        }
      }
    `;

    const skip = true;
    const { data, queryPlan } = await execute({
      query,
      variables: { skip },
    });

    expect(data).toEqual({
      topReviews: [
        { body: 'Love it!' },
        { body: 'Too expensive.' },
        { body: 'Could be better.' },
        { body: 'Prefer something else.' },
        { body: 'Wish I had read this before.' },
      ],
    });

    expect(queryPlan).not.toCallService('accounts');
    expect(queryPlan).toCallService('reviews');
  });

  // Data looks good here, suspect the matcher is incorrect
  it('supports @skip when a boolean condition is not met', async () => {
    const query = `#graphql
      query GetReviewers {
        topReviews {
          body
          author @skip(if: false) {
            name {
              first
              last
            }
          }
        }
      }
    `;

    const { data, queryPlan } = await execute({
      query,
    });

    expect(data).toEqual({
      topReviews: [
        { body: 'Love it!', author: { name: { first: 'Ada', last: 'Lovelace' } } },
        { body: 'Too expensive.', author: { name: { first: 'Ada', last: 'Lovelace' } } },
        { body: 'Could be better.', author: { name: { first: 'Alan', last: 'Turing' } } },
        { body: 'Prefer something else.', author: { name: { first: 'Alan', last: 'Turing' } } },
        { body: 'Wish I had read this before.', author: { name: { first: 'Alan', last: 'Turing' } } },
      ],
    });

    expect(queryPlan).toCallService('accounts');
    expect(queryPlan).toCallService('reviews');
  });

  // Data looks good here, suspect the matcher is incorrect
  it('supports @skip when a boolean condition is not met (variable driven)', async () => {
    const query = `#graphql
      query GetReviewers($skip: Boolean!) {
        topReviews {
          body
          author @skip(if: $skip) {
            name {
              first
              last
            }
          }
        }
      }
    `;

    const skip = false;
    const { data, queryPlan } = await execute({
      query,
      variables: { skip },
    });

    expect(data).toEqual({
      topReviews: [
        { body: 'Love it!', author: { name: { first: 'Ada', last: 'Lovelace' } } },
        { body: 'Too expensive.', author: { name: { first: 'Ada', last: 'Lovelace' } } },
        { body: 'Could be better.', author: { name: { first: 'Alan', last: 'Turing' } } },
        { body: 'Prefer something else.', author: { name: { first: 'Alan', last: 'Turing' } } },
        { body: 'Wish I had read this before.', author: { name: { first: 'Alan', last: 'Turing' } } },
      ],
    });

    expect(queryPlan).toCallService('accounts');
    expect(queryPlan).toCallService('reviews');
  });
});

describe('@include', () => {
  it('supports @include when a boolean condition is not met', async () => {
    const query = `#graphql
      query GetReviewers {
        topReviews {
          body
          author @include(if: false) {
            username
          }
        }
      }
    `;

    const { data, queryPlan } = await execute({
      query,
    });

    expect(data).toEqual({
      topReviews: [
        { body: 'Love it!' },
        { body: 'Too expensive.' },
        { body: 'Could be better.' },
        { body: 'Prefer something else.' },
        { body: 'Wish I had read this before.' },
      ],
    });

    expect(queryPlan).not.toCallService('accounts');
    expect(queryPlan).toCallService('reviews');
  });

  it('supports @include when a boolean condition is not met (variable driven)', async () => {
    const query = `#graphql
      query GetReviewers($include: Boolean!) {
        topReviews {
          body
          author @include(if: $include) {
            username
          }
        }
      }
    `;

    const include = false;
    const { data, queryPlan } = await execute({
      query,
      variables: { include },
    });

    expect(data).toEqual({
      topReviews: [
        { body: 'Love it!' },
        { body: 'Too expensive.' },
        { body: 'Could be better.' },
        { body: 'Prefer something else.' },
        { body: 'Wish I had read this before.' },
      ],
    });

    expect(queryPlan).not.toCallService('accounts');
    expect(queryPlan).toCallService('reviews');
  });

  // Data looks good here, suspect the matcher is incorrect
  // Added the query plan snapshot for a view.
  it('supports @include when a boolean condition is met', async () => {
    const query = `#graphql
      query GetReviewers {
        topReviews {
          body
          author @include(if: true) {
            name {
              first
              last
            }
          }
        }
      }
    `;

    const { data, queryPlan } = await execute({
      query,
    });

    expect(data).toEqual({
      topReviews: [
        { body: 'Love it!', author: { name: { first: 'Ada', last: 'Lovelace' } } },
        { body: 'Too expensive.', author: { name: { first: 'Ada', last: 'Lovelace' } } },
        { body: 'Could be better.', author: { name: { first: 'Alan', last: 'Turing' } } },
        { body: 'Prefer something else.', author: { name: { first: 'Alan', last: 'Turing' } } },
        { body: 'Wish I had read this before.', author: { name: { first: 'Alan', last: 'Turing' } } },
      ],
    });

    expect(queryPlan).toCallService('accounts');
    expect(queryPlan).toCallService('reviews');
  });

  // Data looks good here, suspect the matcher is incorrect
  // Added the query plan snapshot for a view.
  it('supports @include when a boolean condition is met (variable driven)', async () => {
    const query = `#graphql
      query GetReviewers($include: Boolean!) {
        topReviews {
          body
          author @include(if: $include) {
            name {
              first
              last
            }
          }
        }
      }
    `;

    const include = true;
    const { data, queryPlan } = await execute({
      query,
      variables: { include },
    });

    expect(data).toEqual({
      topReviews: [
        { body: 'Love it!', author: { name: { first: 'Ada', last: 'Lovelace' } } },
        { body: 'Too expensive.', author: { name: { first: 'Ada', last: 'Lovelace' } } },
        { body: 'Could be better.', author: { name: { first: 'Alan', last: 'Turing' } } },
        { body: 'Prefer something else.', author: { name: { first: 'Alan', last: 'Turing' } } },
        { body: 'Wish I had read this before.', author: { name: { first: 'Alan', last: 'Turing' } } },
      ],
    });

    expect(queryPlan).toCallService('accounts');
    expect(queryPlan).toCallService('reviews');
  });
});
