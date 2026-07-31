import { useMutation, useQuery } from 'urql';

const UNRELIABLE_DAYS_QUERY = `
  query UnreliableDays($dates: [String!]!) {
    unreliableDays(dates: $dates)
  }
`;

const TOGGLE_UNRELIABLE_DAY_MUTATION = `
  mutation ToggleUnreliableDay($date: String!, $unreliable: Boolean!) {
    toggleUnreliableDay(date: $date, unreliable: $unreliable)
  }
`;

export function useUnreliableDay(date: string) {
  const [{ data, fetching }, refetch] = useQuery({
    query: UNRELIABLE_DAYS_QUERY,
    variables: { dates: [date] },
    requestPolicy: 'cache-and-network',
  });

  const [, toggleMutation] = useMutation(TOGGLE_UNRELIABLE_DAY_MUTATION);

  const unreliable = (data?.unreliableDays as string[] | undefined)?.includes(date) ?? false;

  const toggle = async () => {
    const result = await toggleMutation({ date, unreliable: !unreliable });
    if (!result.error) {
      refetch({ requestPolicy: 'network-only' });
    }
    return result;
  };

  return { unreliable, loading: fetching, toggle, refetch };
}
