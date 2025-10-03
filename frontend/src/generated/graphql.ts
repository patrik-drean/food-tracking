import gql from 'graphql-tag'
import * as Urql from 'urql'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never
}
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
}

export type AddFoodInput = {
  description: Scalars['String']['input']
  nutrition?: InputMaybe<NutritionInput>
}

export type Food = {
  __typename?: 'Food'
  calories?: Maybe<Scalars['Float']['output']>
  carbs?: Maybe<Scalars['Float']['output']>
  createdAt: Scalars['String']['output']
  description: Scalars['String']['output']
  fat?: Maybe<Scalars['Float']['output']>
  id: Scalars['ID']['output']
  isManual: Scalars['Boolean']['output']
  protein?: Maybe<Scalars['Float']['output']>
  updatedAt: Scalars['String']['output']
}

export type Mutation = {
  __typename?: 'Mutation'
  addFood: Food
  analyzeFoodNutrition: NutritionAnalysis
  deleteFood: Food
  updateFoodNutrition: Food
}

export type MutationAddFoodArgs = {
  input: AddFoodInput
}

export type MutationAnalyzeFoodNutritionArgs = {
  description: Scalars['String']['input']
}

export type MutationDeleteFoodArgs = {
  id: Scalars['String']['input']
}

export type MutationUpdateFoodNutritionArgs = {
  input: UpdateFoodNutritionInput
}

export type NutritionAnalysis = {
  __typename?: 'NutritionAnalysis'
  calories: Scalars['Float']['output']
  carbs: Scalars['Float']['output']
  confidence?: Maybe<Scalars['String']['output']>
  fat: Scalars['Float']['output']
  protein: Scalars['Float']['output']
  source: NutritionSource
}

export type NutritionInput = {
  calories?: InputMaybe<Scalars['Float']['input']>
  carbs?: InputMaybe<Scalars['Float']['input']>
  fat?: InputMaybe<Scalars['Float']['input']>
  protein?: InputMaybe<Scalars['Float']['input']>
}

export enum NutritionSource {
  AiGenerated = 'AI_GENERATED',
  Cached = 'CACHED',
  UserEntered = 'USER_ENTERED',
  UserModified = 'USER_MODIFIED',
}

export type Query = {
  __typename?: 'Query'
  foodsByDate: Array<Food>
  recentFoods: Array<Food>
  todaysFoods: Array<Food>
}

export type QueryFoodsByDateArgs = {
  date: Scalars['String']['input']
}

export type QueryRecentFoodsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  search?: InputMaybe<Scalars['String']['input']>
}

export type UpdateFoodNutritionInput = {
  id: Scalars['ID']['input']
  nutrition: NutritionInput
}

export type FoodFragmentFragment = {
  __typename?: 'Food'
  id: string
  description: string
  calories?: number | null
  fat?: number | null
  carbs?: number | null
  protein?: number | null
  isManual: boolean
  createdAt: string
}

export type AddFoodMutationVariables = Exact<{
  input: AddFoodInput
}>

export type AddFoodMutation = {
  __typename?: 'Mutation'
  addFood: {
    __typename?: 'Food'
    id: string
    description: string
    calories?: number | null
    fat?: number | null
    carbs?: number | null
    protein?: number | null
    isManual: boolean
    createdAt: string
  }
}

export type UpdateFoodNutritionMutationVariables = Exact<{
  input: UpdateFoodNutritionInput
}>

export type UpdateFoodNutritionMutation = {
  __typename?: 'Mutation'
  updateFoodNutrition: {
    __typename?: 'Food'
    id: string
    description: string
    calories?: number | null
    fat?: number | null
    carbs?: number | null
    protein?: number | null
    isManual: boolean
    createdAt: string
  }
}

export type TodaysFoodsQueryVariables = Exact<{ [key: string]: never }>

export type TodaysFoodsQuery = {
  __typename?: 'Query'
  todaysFoods: Array<{
    __typename?: 'Food'
    id: string
    description: string
    calories?: number | null
    fat?: number | null
    carbs?: number | null
    protein?: number | null
    isManual: boolean
    createdAt: string
  }>
}

export type RecentFoodsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>
  search?: InputMaybe<Scalars['String']['input']>
}>

export type RecentFoodsQuery = {
  __typename?: 'Query'
  recentFoods: Array<{
    __typename?: 'Food'
    id: string
    description: string
    calories?: number | null
    fat?: number | null
    carbs?: number | null
    protein?: number | null
    isManual: boolean
    createdAt: string
  }>
}

export type FoodsByDateQueryVariables = Exact<{
  date: Scalars['String']['input']
}>

export type FoodsByDateQuery = {
  __typename?: 'Query'
  foodsByDate: Array<{
    __typename?: 'Food'
    id: string
    description: string
    calories?: number | null
    fat?: number | null
    carbs?: number | null
    protein?: number | null
    isManual: boolean
    createdAt: string
  }>
}

export const FoodFragmentFragmentDoc = gql`
  fragment FoodFragment on Food {
    id
    description
    calories
    fat
    carbs
    protein
    isManual
    createdAt
  }
`
export const AddFoodDocument = gql`
  mutation AddFood($input: AddFoodInput!) {
    addFood(input: $input) {
      ...FoodFragment
    }
  }
  ${FoodFragmentFragmentDoc}
`

export function useAddFoodMutation() {
  return Urql.useMutation<AddFoodMutation, AddFoodMutationVariables>(AddFoodDocument)
}
export const UpdateFoodNutritionDocument = gql`
  mutation UpdateFoodNutrition($input: UpdateFoodNutritionInput!) {
    updateFoodNutrition(input: $input) {
      ...FoodFragment
    }
  }
  ${FoodFragmentFragmentDoc}
`

export function useUpdateFoodNutritionMutation() {
  return Urql.useMutation<UpdateFoodNutritionMutation, UpdateFoodNutritionMutationVariables>(
    UpdateFoodNutritionDocument
  )
}
export const TodaysFoodsDocument = gql`
  query TodaysFoods {
    todaysFoods {
      ...FoodFragment
    }
  }
  ${FoodFragmentFragmentDoc}
`

export function useTodaysFoodsQuery(
  options?: Omit<Urql.UseQueryArgs<TodaysFoodsQueryVariables>, 'query'>
) {
  return Urql.useQuery<TodaysFoodsQuery, TodaysFoodsQueryVariables>({
    query: TodaysFoodsDocument,
    ...options,
  })
}
export const RecentFoodsDocument = gql`
  query RecentFoods($limit: Int, $search: String) {
    recentFoods(limit: $limit, search: $search) {
      ...FoodFragment
    }
  }
  ${FoodFragmentFragmentDoc}
`

export function useRecentFoodsQuery(
  options?: Omit<Urql.UseQueryArgs<RecentFoodsQueryVariables>, 'query'>
) {
  return Urql.useQuery<RecentFoodsQuery, RecentFoodsQueryVariables>({
    query: RecentFoodsDocument,
    ...options,
  })
}
export const FoodsByDateDocument = gql`
  query FoodsByDate($date: String!) {
    foodsByDate(date: $date) {
      ...FoodFragment
    }
  }
  ${FoodFragmentFragmentDoc}
`

export function useFoodsByDateQuery(
  options: Omit<Urql.UseQueryArgs<FoodsByDateQueryVariables>, 'query'>
) {
  return Urql.useQuery<FoodsByDateQuery, FoodsByDateQueryVariables>({
    query: FoodsByDateDocument,
    ...options,
  })
}
