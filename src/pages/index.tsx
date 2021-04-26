// Consumo de API
// SPA - hook useEffect, fetch localhost:3333/episodes. Não é indexada
// SSR - em qualquer page, exportar func. getServerSideProps, deve retornar um obj com props {}, toda vez q acessarem a Home
// SSG - só renomear para getStaticProps e retornar um revalidate a mais, Gera um html estático para cada período. Funfa só em prod
import { GetStaticProps } from 'next'
import Image from 'next/image'
import Link  from 'next/link'
import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import { api } from '../services/api'
import { convertDuration } from '../utils/convertDuration'
import { useContext } from 'react'
import { PlayerContext } from '../contexts/playerContext'

import styles from './home.module.scss'

type Episode = {
    id: string,
    title: string,
    members: string,
    thumbnail: string,
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
  const { playList } = useContext(PlayerContext)

  const episodeList = [...latestEp, ...allEpisodes]

  return (
    <div className={styles.homepage}>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {latestEp.map((episode, index) => {
            return (
              <li key={episode.id}>
                <Image width={192} height={192} objectFit="cover" src={episode.thumbnail} alt={episode.title}/>

                <div className={styles.episodeDetail}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={() => playList(episodeList, index)}>
                  <img src="/play-green.svg" alt="Tocar episódio"/>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
          <h2>Todos episódios</h2>

          <table cellSpacing={0}>
            <thead>
              <tr>
                <th></th>
                <th>Podcast</th>
                <th>Integrantes</th>
                <th>Data</th>
                <th>Duração</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {allEpisodes.map((episode, index) => {
                return (
                  <tr key={episode.id}>
                    <td style={{ width: 140 }}>
                      <Image
                        width={120}
                        height={120}
                        src={episode.thumbnail}
                        alt={episode.title}
                        objectFit="cover"
                      />
                    </td>
                    <td>
                      <Link href={`/episodes/${episode.id}`}>
                        <a>{episode.title}</a>
                      </Link>
                    </td>
                    <td>{episode.members}</td>
                    <td style={{ width: 100 }}>{episode.publishedAt}</td>
                    <td>{episode.durationAsString}</td>
                    <td>
                      <button type="button" onClick={() => playList(episodeList, index + latestEp.length)}>
                        <img src="/play-green.svg" alt="Tocar agora"/>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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