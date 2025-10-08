import { useQuery, useMutation } from 'urql';

const GET_MACRO_TARGETS_QUERY = `
  query GetMacroTargets {
    getMacroTargets {
      id
      calories
      protein
      carbs
      fat
    }
  }
`;

const UPDATE_MACRO_TARGETS_MUTATION = `
  mutation UpdateMacroTargets($input: UpdateMacroTargetsInput!) {
    updateMacroTargets(input: $input) {
      id
      calories
      protein
      carbs
      fat
    }
  }
`;

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function useMacroTargets() {
  const [{ data, fetching, error }, refetch] = useQuery({
    query: GET_MACRO_TARGETS_QUERY,
    requestPolicy: 'cache-and-network',
  });

  const [, updateMutation] = useMutation(UPDATE_MACRO_TARGETS_MUTATION);

  const updateTargets = async (targets: MacroTargets) => {
    const result = await updateMutation({ input: targets });
    if (result.data?.updateMacroTargets) {
      refetch({ requestPolicy: 'network-only' });
    }
    return result;
  };

  return {
    targets: data?.getMacroTargets,
    loading: fetching,
    error,
    updateTargets,
    refetch,
  };
}
