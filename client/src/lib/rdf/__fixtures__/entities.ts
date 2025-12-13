export const assetFixture = {
  entityType: 'Asset',
  schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
  identifier: [
    {
      identifierScope: 'me-nexus',
      identifierValue: 'asset-001',
      combinedForm: 'me-nexus:asset-001'
    }
  ],
  name: 'Test Video Asset',
  AssetSC: {
    structuralType: 'Digital.MovingImage',
    structuralProperties: {
      mediaType: 'video/mp4',
      fileSize: 1048576,
      fileName: 'test-video.mp4',
      frameWidth: 1920,
      frameHeight: 1080,
      frameRate: '24',
      duration: 120
    }
  },
  assetFC: {
    functionalType: 'Intermediate'
  }
};

export const participantFixture = {
  entityType: 'Participant',
  schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
  identifier: [
    {
      identifierScope: 'me-nexus',
      identifierValue: 'participant-001',
      combinedForm: 'me-nexus:participant-001'
    }
  ],
  name: 'John Smith',
  ParticipantSC: {
    entityType: 'Person',
    structuralType: 'individual',
    personName: {
      fullName: 'John Smith',
      firstName: 'John',
      lastName: 'Smith'
    },
    contact: {
      email: 'john@example.com',
      phone: '+1-555-0100'
    }
  },
  participantFC: {
    functionalType: 'Director'
  },
  Location: 'me-nexus:location-001'
};

export const taskFixture = {
  entityType: 'Task',
  schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
  identifier: [
    {
      identifierScope: 'me-nexus',
      identifierValue: 'task-001',
      combinedForm: 'me-nexus:task-001'
    }
  ],
  name: 'Color Grading',
  TaskSC: {
    structuralType: 'TaskAsUnit'
  },
  taskFC: {
    functionalType: 'Post-Production',
    l1Category: 'Post-Production',
    l2Service: 'Color & Finish',
    l3Service: 'Color Grading'
  },
  state: 'In Process',
  workUnit: {
    identifier: [
      {
        identifierScope: 'me-nexus',
        identifierValue: 'workunit-001',
        combinedForm: 'me-nexus:workunit-001'
      }
    ],
    participantRef: 'me-nexus:participant-001'
  },
  Context: [
    {
      entityType: 'Context',
      schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
      identifier: [
        {
          identifierScope: 'me-nexus',
          identifierValue: 'context-001',
          combinedForm: 'me-nexus:context-001'
        }
      ],
      contextType: 'production',
      scheduling: {
        scheduledStart: '2025-01-01T09:00:00Z',
        scheduledEnd: '2025-01-01T17:00:00Z'
      },
      contributesTo: {
        CreativeWork: ['me-nexus:creative-work-001']
      },
      uses: {
        Infrastructure: ['me-nexus:infrastructure-001'],
        Asset: ['me-nexus:asset-001']
      },
      hasInputAssets: ['me-nexus:asset-001'],
      hasOutputAssets: ['me-nexus:asset-002']
    }
  ]
};

export const creativeWorkFixture = {
  entityType: 'CreativeWork',
  schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
  identifier: [
    {
      identifierScope: 'me-nexus',
      identifierValue: 'creative-work-001',
      combinedForm: 'me-nexus:creative-work-001'
    }
  ],
  name: 'Test Film',
  title: {
    titleClass: 'release',
    titleValue: 'Test Film'
  }
};

export const infrastructureFixture = {
  entityType: 'Infrastructure',
  schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
  identifier: [
    {
      identifierScope: 'me-nexus',
      identifierValue: 'infrastructure-001',
      combinedForm: 'me-nexus:infrastructure-001'
    }
  ],
  name: 'DaVinci Resolve',
  description: 'Color grading software',
  structuralCharacteristics: {
    structuralType: 'Software'
  }
};

export const locationFixture = {
  entityType: 'Location',
  schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
  identifier: [
    {
      identifierScope: 'me-nexus',
      identifierValue: 'location-001',
      combinedForm: 'me-nexus:location-001'
    }
  ],
  name: 'Studio A',
  description: 'Main production studio',
  address: {
    fullAddress: '123 Film Street, Los Angeles, CA 90028'
  },
  location: {
    lat: 34.0928,
    lon: -118.3287
  }
};

export const contextFixture = {
  entityType: 'Context',
  schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
  identifier: [
    {
      identifierScope: 'me-nexus',
      identifierValue: 'context-002',
      combinedForm: 'me-nexus:context-002'
    }
  ],
  name: 'Production Context',
  contextClass: 'production'
};

export const allFixtures = {
  Asset: assetFixture,
  Participant: participantFixture,
  Task: taskFixture,
  CreativeWork: creativeWorkFixture,
  Infrastructure: infrastructureFixture,
  Location: locationFixture,
  Context: contextFixture
};
