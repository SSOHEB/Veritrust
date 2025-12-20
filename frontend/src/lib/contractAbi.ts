export const contractAbi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "applicationId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "enum TalentAIApplications.ApplicationStatus",
				"name": "status",
				"type": "uint8"
			}
		],
		"name": "ApplicationStatusUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "applicationId",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "string",
				"name": "jobId",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "string",
				"name": "candidateId",
				"type": "string"
			}
		],
		"name": "ApplicationSubmitted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "candidateId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "CandidateRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "companyId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "CompanyRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "jobId",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "string",
				"name": "companyId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "title",
				"type": "string"
			}
		],
		"name": "JobPosted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_jobId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_companyId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "string[]",
				"name": "_requirements",
				"type": "string[]"
			},
			{
				"internalType": "string[]",
				"name": "_skills",
				"type": "string[]"
			},
			{
				"internalType": "enum TalentAIApplications.Location",
				"name": "_location",
				"type": "uint8"
			},
			{
				"internalType": "string[]",
				"name": "_salaryRange",
				"type": "string[]"
			},
			{
				"internalType": "enum TalentAIApplications.JobType",
				"name": "_jobType",
				"type": "uint8"
			}
		],
		"name": "postJob",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_candidateId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string[]",
				"name": "_description",
				"type": "string[]"
			},
			{
				"internalType": "string[]",
				"name": "_contacts",
				"type": "string[]"
			},
			{
				"internalType": "string[]",
				"name": "_education",
				"type": "string[]"
			},
			{
				"internalType": "string[]",
				"name": "_skills",
				"type": "string[]"
			},
			{
				"internalType": "string[]",
				"name": "_resumePath",
				"type": "string[]"
			},
			{
				"internalType": "string",
				"name": "_profileScore",
				"type": "string"
			}
		],
		"name": "registerCandidate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_companyId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_image",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string[]",
				"name": "_contacts",
				"type": "string[]"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "string[]",
				"name": "_misc",
				"type": "string[]"
			},
			{
				"internalType": "string",
				"name": "_companyScore",
				"type": "string"
			}
		],
		"name": "registerCompany",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_applicationId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_jobId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_candidateId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_applicationDate",
				"type": "string"
			}
		],
		"name": "submitApplication",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_applicationId",
				"type": "string"
			},
			{
				"internalType": "enum TalentAIApplications.ApplicationStatus",
				"name": "_status",
				"type": "uint8"
			}
		],
		"name": "updateApplicationStatus",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_candidateId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_newScore",
				"type": "string"
			}
		],
		"name": "updateCandidateProfileScore",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_companyId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_newScore",
				"type": "string"
			}
		],
		"name": "updateCompanyProfileScore",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "applications",
		"outputs": [
			{
				"internalType": "string",
				"name": "applicationId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "jobId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "candidateId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "applicationDate",
				"type": "string"
			},
			{
				"internalType": "enum TalentAIApplications.ApplicationStatus",
				"name": "status",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "candidates",
		"outputs": [
			{
				"internalType": "string",
				"name": "candidateId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "profileScore",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "companies",
		"outputs": [
			{
				"internalType": "string",
				"name": "companyId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "image",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "companyScore",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllApplications",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "applicationId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "jobId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "candidateId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "applicationDate",
						"type": "string"
					},
					{
						"internalType": "enum TalentAIApplications.ApplicationStatus",
						"name": "status",
						"type": "uint8"
					}
				],
				"internalType": "struct TalentAIApplications.Application[]",
				"name": "result",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllCandidates",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "candidateId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string[]",
						"name": "description",
						"type": "string[]"
					},
					{
						"internalType": "string[]",
						"name": "contacts",
						"type": "string[]"
					},
					{
						"internalType": "string[]",
						"name": "education",
						"type": "string[]"
					},
					{
						"internalType": "string[]",
						"name": "skills",
						"type": "string[]"
					},
					{
						"internalType": "string[]",
						"name": "resumePath",
						"type": "string[]"
					},
					{
						"internalType": "string",
						"name": "profileScore",
						"type": "string"
					}
				],
				"internalType": "struct TalentAIApplications.Candidate[]",
				"name": "result",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllCompanies",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "companyId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "image",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string[]",
						"name": "contacts",
						"type": "string[]"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "string[]",
						"name": "misc",
						"type": "string[]"
					},
					{
						"internalType": "string",
						"name": "companyScore",
						"type": "string"
					}
				],
				"internalType": "struct TalentAIApplications.Company[]",
				"name": "result",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllJobs",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "jobId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "companyId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "title",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "string[]",
						"name": "requirements",
						"type": "string[]"
					},
					{
						"internalType": "string[]",
						"name": "skills",
						"type": "string[]"
					},
					{
						"internalType": "enum TalentAIApplications.Location",
						"name": "location",
						"type": "uint8"
					},
					{
						"internalType": "string[]",
						"name": "salaryRange",
						"type": "string[]"
					},
					{
						"internalType": "enum TalentAIApplications.JobType",
						"name": "jobType",
						"type": "uint8"
					},
					{
						"internalType": "enum TalentAIApplications.JobStatus",
						"name": "status",
						"type": "uint8"
					}
				],
				"internalType": "struct TalentAIApplications.Job[]",
				"name": "result",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_applicationId",
				"type": "string"
			}
		],
		"name": "getApplication",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "applicationId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "jobId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "candidateId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "applicationDate",
						"type": "string"
					},
					{
						"internalType": "enum TalentAIApplications.ApplicationStatus",
						"name": "status",
						"type": "uint8"
					}
				],
				"internalType": "struct TalentAIApplications.Application",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_candidateId",
				"type": "string"
			}
		],
		"name": "getCandidate",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "candidateId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string[]",
						"name": "description",
						"type": "string[]"
					},
					{
						"internalType": "string[]",
						"name": "contacts",
						"type": "string[]"
					},
					{
						"internalType": "string[]",
						"name": "education",
						"type": "string[]"
					},
					{
						"internalType": "string[]",
						"name": "skills",
						"type": "string[]"
					},
					{
						"internalType": "string[]",
						"name": "resumePath",
						"type": "string[]"
					},
					{
						"internalType": "string",
						"name": "profileScore",
						"type": "string"
					}
				],
				"internalType": "struct TalentAIApplications.Candidate",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_companyId",
				"type": "string"
			}
		],
		"name": "getCompany",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "companyId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "image",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string[]",
						"name": "contacts",
						"type": "string[]"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "string[]",
						"name": "misc",
						"type": "string[]"
					},
					{
						"internalType": "string",
						"name": "companyScore",
						"type": "string"
					}
				],
				"internalType": "struct TalentAIApplications.Company",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_jobId",
				"type": "string"
			}
		],
		"name": "getJob",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "jobId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "companyId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "title",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "string[]",
						"name": "requirements",
						"type": "string[]"
					},
					{
						"internalType": "string[]",
						"name": "skills",
						"type": "string[]"
					},
					{
						"internalType": "enum TalentAIApplications.Location",
						"name": "location",
						"type": "uint8"
					},
					{
						"internalType": "string[]",
						"name": "salaryRange",
						"type": "string[]"
					},
					{
						"internalType": "enum TalentAIApplications.JobType",
						"name": "jobType",
						"type": "uint8"
					},
					{
						"internalType": "enum TalentAIApplications.JobStatus",
						"name": "status",
						"type": "uint8"
					}
				],
				"internalType": "struct TalentAIApplications.Job",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "jobs",
		"outputs": [
			{
				"internalType": "string",
				"name": "jobId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "companyId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "enum TalentAIApplications.Location",
				"name": "location",
				"type": "uint8"
			},
			{
				"internalType": "enum TalentAIApplications.JobType",
				"name": "jobType",
				"type": "uint8"
			},
			{
				"internalType": "enum TalentAIApplications.JobStatus",
				"name": "status",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "sayHello",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	}
]