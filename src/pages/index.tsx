// Consumo de API
// SPA - hook useEffect, fetch localhost:3333/episodes. Não é indexada
// SSR - em qualquer page, exportar func. getServerSideProps, deve retornar um obj com props {}, toda vez q acessarem a Home
// SSG - só renomear para getStaticProps e retornar um revalidate a mais, Gera um html estático para cada período. Funfa só em prod
import { GetStaticProps } from 'next'
import Image from 'next/image'
import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import { api } from '../services/api'
import { convertDuration } from '../utils/convertDuration'
import styles from './home.module.scss'

type Episode = {
    id: string,
    title: string,
    members: string,
    thumbnail: string,
    description: string,
    duration: number,
    durationAsString: string,
    url: string,
    publishedAt: string
}

type HomeProps = {
  latestEp: Episode[],                //ou Array<Episode>, Array é um Generic - array de que?
  allEpisodes: Episode[]
}


export default function Home({ latestEp, allEpisodes }: HomeProps) {
  return (
    <div className={styles.homepage}>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {latestEp.map(episode => {
            return (
              <li key={episode.id}>
                <Image width={192} height={192} objectFit="cover" src={episode.thumbnail} alt={episode.title}/>

                <div className={styles.episodeDetail}> 
                  <a href="">{episode.title}</a>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button">
                  <img src="/play-green.svg" alt="Tocar episódio"/>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        
      </section>
    </div>
  )
}


export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })
  
  const episodes = data.map( episode => {
    return {
      id: episode.id,
      title: episode.title,
      members: episode.members,
      thumbnail: episode.thumbnail,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {locale: ptBR}),
      duration: Number(episode.file.duration),
      durationAsString: convertDuration(Number(episode.file.duration)),
      description: episode.description,
      url: episode.file.url
    }
  })

  const latestEp = episodes.slice(0, 2)
  const allEpisodes = episodes.slice(2, episodes.length)


  return {
    props: {
      latestEp,
      allEpisodes

    },
    revalidate: 60 * 60 * 8
  }
}