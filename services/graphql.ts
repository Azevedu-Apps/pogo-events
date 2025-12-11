
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
