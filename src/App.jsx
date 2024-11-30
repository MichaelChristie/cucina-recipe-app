import Card from './components/Card'

const cards = [
  {
    title: 'Card 1',
    description: 'This is the first card description',
    image: 'https://picsum.photos/400/300?random=1'
  },
  {
    title: 'Card 2',
    description: 'This is the second card description',
    image: 'https://picsum.photos/400/300?random=2'
  },
  {
    title: 'Card 3',
    description: 'This is the third card description',
    image: 'https://picsum.photos/400/300?random=3'
  },
];

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">My Card Grid</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {cards.map((card, index) => (
            <Card
              key={index}
              title={card.title}
              description={card.description}
              image={card.image}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default App