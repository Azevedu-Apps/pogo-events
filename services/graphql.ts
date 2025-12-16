
export const listPogoEvents = /* GraphQL */ `
  query ListPogoEvents {
    listPogoEvents {
      items {
        id
        name
        type
        start
        end
        location
        cover
        research
        eggTitle
        eggDesc
        bonuses
        images
        # Custom Types must have sub-selections
        payment {
          type
          cost
          ticketCost
          ticketBonuses
        }
        featured {
          name
          image
        }
        paidResearch {
          name
          cost
          details
        }
        # JSON fields stored as strings
        spawnCategories
        attacks
        raidsList
        customTexts
        eggs
        createdAt
        updatedAt
      }
    }
  }
`;

export const createPogoEvent = /* GraphQL */ `
  mutation CreatePogoEvent(
    $input: CreatePogoEventInput!
  ) {
    createPogoEvent(input: $input) {
      id
      name
      updatedAt
    }
  }
`;

export const updatePogoEvent = /* GraphQL */ `
  mutation UpdatePogoEvent(
    $input: UpdatePogoEventInput!
  ) {
    updatePogoEvent(input: $input) {
      id
      name
      updatedAt
    }
  }
`;

export const deletePogoEvent = /* GraphQL */ `
  mutation DeletePogoEvent(
    $input: DeletePogoEventInput!
  ) {
    deletePogoEvent(input: $input) {
      id
    }
  }
`;

// --- USER PROGRESS (EVENT CHECKLIST) ---
export const listUserEventProgresses = /* GraphQL */ `
  query ListUserEventProgresses($filter: ModelUserEventProgressFilterInput) {
    listUserEventProgresses(filter: $filter) {
      items {
        id
        eventId
        progressData
        updatedAt
      }
    }
  }
`;

export const createUserEventProgress = /* GraphQL */ `
  mutation CreateUserEventProgress($input: CreateUserEventProgressInput!) {
    createUserEventProgress(input: $input) {
      id
      eventId
      progressData
    }
  }
`;

export const updateUserEventProgress = /* GraphQL */ `
  mutation UpdateUserEventProgress($input: UpdateUserEventProgressInput!) {
    updateUserEventProgress(input: $input) {
      id
      eventId
      progressData
    }
  }
`;

// --- USER POKEDEX (GLOBAL) ---
export const listUserPokedexes = /* GraphQL */ `
  query ListUserPokedexes {
    listUserPokedexes {
      items {
        id
        progressData
        updatedAt
      }
    }
  }
`;

export const createUserPokedex = /* GraphQL */ `
  mutation CreateUserPokedex($input: CreateUserPokedexInput!) {
    createUserPokedex(input: $input) {
      id
      progressData
    }
  }
`;

export const updateUserPokedex = /* GraphQL */ `
  mutation UpdateUserPokedex($input: UpdateUserPokedexInput!) {
    updateUserPokedex(input: $input) {
      id
      progressData
    }
  }
`;
