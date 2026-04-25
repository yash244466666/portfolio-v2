export const firstNames = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
  "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Christopher", "Karen", "Charles", "Lisa", "Daniel", "Nancy",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
  "Kenneth", "Carol", "Kevin", "Amanda", "Brian", "Dorothy", "George", "Melissa",
  "Timothy", "Deborah", "Ronald", "Stephanie", "Edward", "Rebecca", "Jason", "Sharon",
  "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
  "Nicholas", "Angela", "Eric", "Shirley", "Jonathan", "Anna", "Stephen", "Brenda",
  "Larry", "Pamela", "Justin", "Emma", "Scott", "Nicole", "Brandon", "Helen",
  "Benjamin", "Samantha", "Samuel", "Katherine", "Raymond", "Christine", "Gregory", "Debra",
  "Frank", "Rachel", "Alexander", "Carolyn", "Patrick", "Janet", "Jack", "Catherine",
  "Dennis", "Maria", "Jerry", "Heather", "Tyler", "Diane", "Aaron", "Ruth",
  "Jose", "Julie", "Nathan", "Olivia", "Henry", "Joyce", "Peter", "Virginia",
  "Adam", "Victoria", "Douglas", "Kelly", "Zachary", "Lauren", "Harold", "Christina",
]

export const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
  "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill",
  "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell",
  "Mitchell", "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz",
  "Parker", "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales",
  "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson",
  "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward",
  "Richardson", "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray",
  "Mendoza", "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel",
  "Myers", "Long", "Ross", "Foster", "Jimenez", "Powell", "Jenkins", "Perry",
  "Russell", "Sullivan", "Wallace", "Soto", "Cole", "Jordan", "Dixon", "Spencer",
]

export const domains = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "protonmail.com",
  "icloud.com", "mail.com", "fastmail.com", "zoho.com", "yandex.com",
]

export const streets = [
  "Main St", "Oak Ave", "Maple Dr", "Cedar Ln", "Pine Rd", "Elm St",
  "Washington Blvd", "Park Ave", "Lake Dr", "Hill Rd", "Sunset Blvd",
  "River Rd", "Forest Ave", "Spring St", "Valley Dr", "Meadow Ln",
  "Highland Ave", "Church St", "Mill Rd", "Broadway",
]

export const cities = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
  "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville",
  "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis", "Seattle",
  "Denver", "Washington", "Boston", "Nashville", "Detroit", "Portland", "Memphis",
  "Louisville", "Milwaukee", "Tucson", "Fresno", "Sacramento",
]

export const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Japan", "Brazil", "India", "Mexico", "Italy", "Spain",
  "Netherlands", "Sweden", "Norway", "South Korea", "Argentina", "New Zealand",
]

function secureRandom(max: number): number {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return array[0] % max
}

function pickRandom<T>(arr: T[]): T {
  return arr[secureRandom(arr.length)]
}

export function fakeFirstName(): string {
  return pickRandom(firstNames)
}

export function fakeLastName(): string {
  return pickRandom(lastNames)
}

export function fakeFullName(): string {
  return `${fakeFirstName()} ${fakeLastName()}`
}

export function fakeEmail(): string {
  const first = fakeFirstName().toLowerCase()
  const last = fakeLastName().toLowerCase()
  const formats = [
    `${first}.${last}`,
    `${first}${secureRandom(999)}`,
    `${first}_${last}`,
    `${first[0]}${last}`,
    `${first}.${last}${secureRandom(99)}`,
  ]
  return `${pickRandom(formats)}@${pickRandom(domains)}`
}

export function fakePhone(): string {
  const area = `${secureRandom(9) + 1}${secureRandom(10)}${secureRandom(10)}`
  const mid = `${secureRandom(10)}${secureRandom(10)}${secureRandom(10)}`
  const end = `${secureRandom(10)}${secureRandom(10)}${secureRandom(10)}${secureRandom(10)}`
  return `(${area}) ${mid}-${end}`
}

export function fakeAddress(): string {
  const number = secureRandom(9999) + 1
  const street = pickRandom(streets)
  const city = pickRandom(cities)
  const stateAbbr = ["NY", "CA", "TX", "FL", "IL", "PA", "OH", "GA", "NC", "MI"]
  const state = pickRandom(stateAbbr)
  const zip = `${secureRandom(10)}${secureRandom(10)}${secureRandom(10)}${secureRandom(10)}${secureRandom(10)}`
  return `${number} ${street}, ${city}, ${state} ${zip}`
}

export function fakeCompany(): string {
  const prefixes = ["Acme", "Global", "Tech", "Prime", "Alpha", "Nova", "Apex", "Elite", "Core", "Vantage"]
  const suffixes = ["Corp", "Inc", "LLC", "Co", "Group", "Systems", "Labs", "Solutions", "Industries", "Ventures"]
  return `${pickRandom(prefixes)} ${pickRandom(suffixes)}`
}