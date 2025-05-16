import { useEffect, useState } from "react"
import axios from "axios"
import { Field } from "../../../types/article"

const TestFetchField = () => {
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    axios.get("/api/fields?isActive=true")
      .then(res => {
        if (Array.isArray(res.data.data)) {
          setFields(res.data.data)
        } else if (Array.isArray(res.data)) {
          setFields(res.data)
        } else {
          setFields([])
        }
      })
      .catch(err => {
        setError("Error fetching fields")
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h2>Test Fetch Field (Direct)</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <pre>{JSON.stringify(fields, null, 2)}</pre>
      {Array.isArray(fields) && fields.length > 0 ? (
        <ul>
          {fields.map((field: {_id: string, name: string}) => (
            <li key={field._id}>{field.name} (ID: {field._id})</li>
          ))}
        </ul>
      ) : (
        <p>No fields data.</p>
      )}
    </div>
  )
}

export default TestFetchField
