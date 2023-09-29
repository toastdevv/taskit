import { useEffect, useRef, useState } from "react";
import auth from "../utils/auth";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import axios from "axios";

// interface UserData {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

interface Group {
  id: number;
  name: string;
}

export default function Page() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const newGroupRef = useRef<HTMLInputElement>(null);

  const [groups, setGroups] = useState<Array<Group>>([]);

  const navigate = useNavigate();

  useEffect(() => {
    auth()
      .then((data) => {
        if (!data) {
          navigate("/login");
        }
        setUserData(data);
      })
      .catch((e) => {
        setError(e.message);
      });
  }, [navigate]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/groups", {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((data) => {
        setGroups(data.data);
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (error) {
    throw <h1>{error}</h1>;
  }

  async function handleGroupAdd() {
    if (newGroupRef.current) {
      const { data } = await axios.post(
        "http://localhost:3000/groups/add",
        {
          name: newGroupRef.current.value,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      setGroups([
        ...groups,
        {
          id: data.id,
          name: data.name,
        },
      ]);
      newGroupRef.current.value = "";
    }
  }

  async function handleGroupDelete(id: number) {
    const { data } = await axios.delete(
      "http://localhost:3000/groups/delete/" + id,
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    const copyGroups = groups.filter((groups) => groups.id != data.id);
    setGroups(copyGroups);
  }

  if (userData) {
    // const user = userData as UserData;

    return (
      <div className="h-screen w-screen flex flex-row">
        <div className="h-full w-96 bg-gray-200 flex-shrink-0 border-r-gray-500 border-r-2 relative">
          <div className="px-8">
            <h1 className="text-3xl font-semibold pt-8 pb-5">Task Groups</h1>
            {groups.map((group) => (
              <Group
                key={group.id}
                id={group.id}
                name={group.name}
                onDelete={handleGroupDelete}
              />
            ))}
          </div>
          <div className="absolute bottom-0 w-full flex flex-row items-center justify-evenly py-2">
            <input
              type="text"
              placeholder="Add a new tasks group"
              className="border-2 border-black p-1"
              ref={newGroupRef}
            />
            <button
              type="submit"
              className="underline hover:no-underline"
              onClick={handleGroupAdd}
            >
              Add
            </button>
          </div>
        </div>
        <Outlet />
      </div>
    );
  }
}

function Group({
  id,
  name,
  onDelete,
}: {
  id: number;
  name: string;
  onDelete: (id: number) => void;
}) {
  function handleTaskDelete() {
    onDelete(id);
  }
  return (
    <div className="h-12 px-4 my-4 w-full bg-black bg-opacity-5 drop-shadow-lg hover:bg-opacity-10 rounded-lg flex items-center justify-between group">
      <Link to={"/" + id} className="w-full">
        <h1 className="text-xl font-medium py-6">{name}</h1>
      </Link>
      <button className="text-xl" onClick={handleTaskDelete}>
        <IoClose className="text-2xl text-black text-opacity-0 hover:bg-black hover:bg-opacity-10 group-hover:text-opacity-70 rounded-lg" />
      </button>
    </div>
  );
}
