import { useEffect, useRef, useState } from "react";
import auth from "../utils/auth";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
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
  id: string;
  name: string;
}

export default function Page() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const newGroupRef = useRef<HTMLInputElement>(null);

  const [groups, setGroups] = useState<Array<Group>>([]);

  const navigate = useNavigate();

  const location = useLocation().pathname.replace("/", "");

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
      .get(import.meta.env.VITE_BACKEND_URL + "/groups", {
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
    return (
      <div className="h-screen w-screen flex flex-row">
        <div className="h-full w-96 bg-gray-200 flex-shrink-0 border-r-gray-500 border-r-2 relative">
          <div className="px-8">
            <h1 className="text-3xl font-semibold pt-8 pb-5">Task Groups</h1>
            {Array(3)
              .fill(1)
              .map((_, i) => (
                <Group key={i} id={""} name={""} onDelete={handleGroupDelete} />
              ))}
          </div>
        </div>
        <Outlet />
      </div>
    );
  }

  if (error) {
    throw <h1>{error}</h1>;
  }

  async function handleGroupAdd(e: React.FormEvent) {
    e.preventDefault();
    if (newGroupRef.current) {
      const { data } = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/groups",
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

  async function handleGroupDelete(id: string) {
    const copyGroups = groups.filter((groups) => groups.id != id);
    setGroups(copyGroups);
    if (id == location) {
      if (copyGroups.length == 0) {
        navigate("/");
      } else {
        navigate("/" + copyGroups[0].id);
      }
    }
    await axios.delete(import.meta.env.VITE_BACKEND_URL + "/groups/" + id, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
  }

  if (userData) {
    // const user = userData as UserData;

    return (
      <div className="h-screen w-screen flex flex-row">
        <div className="h-full w-96 bg-gray-200 flex flex-col flex-shrink-0 border-r-gray-500 border-r-2 relative">
          <div className="h-full flex-shrink px-8 overflow-auto">
            <h1 className="text-3xl font-semibold pt-8 pb-5">Task Groups</h1>
            {groups.length > 0 ? (
              <>
                {groups.map((group) => (
                  <Group
                    key={group.id}
                    id={group.id}
                    name={group.name}
                    onDelete={handleGroupDelete}
                  />
                ))}
              </>
            ) : (
              <h1 className="text-xl font-semibold py-4 text-black text-opacity-50">
                No groups were added yet
              </h1>
            )}
          </div>
          <div className="h-auto w-full pb-2 flex flex-col items-center justify-center bg-gray-200">
            <Link to="/logout" className="w-full pl-10">
              <h1 className="text-xl font-medium py-3">Logout</h1>
            </Link>
            <form
              className="w-full flex flex-row items-center justify-evenly"
              onSubmit={handleGroupAdd}
            >
              <input
                type="text"
                placeholder="Add a new tasks group"
                className="border-2 border-black p-1"
                ref={newGroupRef}
              />
              <button type="submit" className="underline hover:no-underline">
                Add
              </button>
            </form>
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
  id: string;
  name: string;
  onDelete: (id: string) => void;
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
