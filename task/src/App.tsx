import { useEffect, useState, useCallback } from 'react'
import './App.css'
import { Button, Card, CardActions, CardContent, CardMedia, Grid, Typography } from '@mui/material'

import axios from 'axios'
import { db} from './db'
import type { User } from './db'

interface RawUser {
  login: { uuid: string }
  name: { title: string; first: string; last: string }
  picture: { medium: string }
}

function App() {
  const [count, setCount] = useState(0)
  const [users, setAllUsers] = useState<User[]>([]) 

  
  const fetchUsers = useCallback(async () => {
    const allUsers = await axios.get<{ results: RawUser[] }>('https://randomuser.me/api/?results=50')
    const result = allUsers.data.results

    const formattedUsers: User[] = result.map((user) => ({
      id: user.login.uuid,
      name: `${user.name.title} ${user.name.first} ${user.name.last}`,
      image: user.picture.medium,
    }))

    await db.users.bulkAdd(formattedUsers)
    const usersFromDb = await db.users.toArray()

    setAllUsers(usersFromDb)
    setCount(usersFromDb.length)
  }, [])
  
  const fetchUsersFromDb = async () => {
    const result = await db.users.toArray();
    return result;
  };

  useEffect(()=>{
    let cancelled = false

    ;(async () => {
      const result = await fetchUsersFromDb()
      if (result.length > 0) {
        if (!cancelled) {
          setAllUsers(result)
          setCount(result.length)
        }
      } else {
        await fetchUsers()
      }
    })()

    return () => { cancelled = true }
  }, [fetchUsers])

  const refreshUsers = async () => {
    await db.users.clear()
    await fetchUsers()
  }

  const deleteUser = async (id: string) => {
    await db.users.delete(id)
    setAllUsers(prev => (
      prev.filter(user => user.id !== id)
    ))
    setCount(prev => prev-1)
  }
  
  return (
    <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
      <div style={{display:'flex', gap:'3px', alignItems:'center'}}>
        <div>
          Total Count : {count}
        </div>
        <div>
          <Button color='primary' onClick={refreshUsers}>
            Refresh
          </Button>
        </div>
      </div>
      <div style={{display:'flex', gap:'2px'}}>
        <Grid container spacing={2}>
          {users.map(user => (
            <div key={user.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={user.image}
                  alt='user image'
                />

                <CardContent>
                  <Typography variant="h6" align="center">
                    {user.name}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button color="error" fullWidth onClick={()=>deleteUser(user.id)}>
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </div>
          ))}
        </Grid>
      </div>
    </div>
  )
}

export default App
