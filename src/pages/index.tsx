// Consumo de API
// SPA - hook useEffect, fetch localhost:3333/episodes. Não é indexada
// SSR - em qualquer page, exportar func. getServerSideProps, deve retornar um obj com props {}, toda vez q acessarem a Home
// SSG - só renomear para getStaticProps e retornar um revalidate a mais, Gera um html estático para cada período. Funfa só em prod
export default function Home(props) {
  console.log(props.episodes)
  return (
    <h1>Index</h1>
  )
}


export async function getStaticProps() {
  const response = await fetch('http://localhost:3333/episodes')
  const data = await response.json()

  return {
    props: {
      episodes: data
    },
    revalidate: 60 * 60 * 8
  }
}