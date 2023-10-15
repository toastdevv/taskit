import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import axios from "axios";

interface Task {
  id: string;
  name: string;
  done: boolean;
}

export default function Page() {
  const { groupId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const newTaskRef = useRef<HTMLInputElement>(null);

  const [tasks, setTasks] = useState<Array<Task>>([]);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_BACKEND_URL + "/groups/" + groupId, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((data) => {
        setGroupName(data.data.name);
      })
      .catch((e) => {
        setError(e);
      });
    axios
      .get(import.meta.env.VITE_BACKEND_URL + "/tasks/" + groupId, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((data) => {
        setTasks(data.data as Task[]);
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [groupId]);

  if (loading) {
    return (
      <div className="h-full w-full bg-gray-50 flex flex-col items-center">
        <div className="w-[28rem] h-full relative">
          <h1 className="text-5xl font-semibold pt-12 pb-10">Loading...</h1>
          {Array(3)
            .fill(1)
            .map((_, i) => (
              <Task
                key={i}
                id={""}
                name={"..."}
                onCheck={handleTaskCheck}
                onDelete={handleTaskDelete}
              />
            ))}
        </div>
      </div>
    );
  }

  if (error) {
    throw <h1>{error}</h1>;
  }

  async function handleTaskCheck(id: string) {
    const copyTasks = tasks.map((task) => {
      if (task.id == id) {
        return { ...task, done: !task.done };
      }
      return task;
    });
    setTasks(copyTasks);
    await axios.put(
      import.meta.env.VITE_BACKEND_URL + "/tasks",
      {
        id: id,
      },
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
  }

  async function handleTaskAdd(e: React.FormEvent) {
    e.preventDefault();
    if (newTaskRef.current) {
      const { data } = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/tasks",
        {
          name: newTaskRef.current.value,
          groupId: groupId,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      setTasks([
        ...tasks,
        {
          id: data.id,
          name: data.name,
          done: data.done,
        },
      ]);
      newTaskRef.current.value = "";
    }
  }

  async function handleTaskDelete(id: string) {
    const copyTasks = tasks.filter((task) => task.id != id);
    setTasks(copyTasks);
    await axios.delete(import.meta.env.VITE_BACKEND_URL + "/tasks/" + id, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
  }

  return (
    <div className="h-full w-full bg-gray-50 flex flex-col items-center">
      <div className="w-[28rem] h-full flex flex-col">
        <div className="w-[28rem] h-full overflow-auto flex-shrink">
          <h1 className="text-5xl font-semibold pt-12 pb-10">{groupName}</h1>
          {tasks.length > 0 ? (
            <>
              {tasks
                .filter((task) => !task.done)
                .map((task) => (
                  <Task
                    key={task.id}
                    id={task.id}
                    name={task.name}
                    onCheck={handleTaskCheck}
                    onDelete={handleTaskDelete}
                  />
                ))}
              {tasks.filter((task) => task.done).length > 0 ? (
                <h1 className="text-xl font-semibold py-4 text-black text-opacity-50">
                  Finished
                </h1>
              ) : null}
              {tasks
                .filter((task) => task.done)
                .map((task) => (
                  <Task
                    key={task.id}
                    id={task.id}
                    name={task.name}
                    done
                    onCheck={handleTaskCheck}
                    onDelete={handleTaskDelete}
                  />
                ))}
            </>
          ) : (
            <h1 className="text-xl font-semibold py-4 text-black text-opacity-50">
              No tasks were added yet
            </h1>
          )}
        </div>
        <div className="h-auto bottom-0 w-full py-2">
          <form
            className="w-full flex flex-row items-center justify-evenly "
            onSubmit={handleTaskAdd}
          >
            <input
              type="text"
              placeholder="Add a new task"
              className="border-2 border-black p-1"
              ref={newTaskRef}
            />
            <button type="submit" className="underline hover:no-underline">
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Task({
  id,
  name,
  done,
  onCheck,
  onDelete,
}: {
  id: string;
  name: string;
  done?: boolean;
  onCheck: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  function handleTaskCheck() {
    onCheck(id);
  }

  function handleTaskDelete() {
    onDelete(id);
  }

  return (
    <div className="flex flex-row items-center justify-between w-full py-2 hover:bg-black hover:bg-opacity-5 p-2 rounded-md group">
      <div className="flex flex-row items-center">
        <input
          type="checkbox"
          className="h-5 w-5 cursor-pointer"
          defaultChecked={done && true}
          onClick={handleTaskCheck}
        />
        <h1
          className={`pl-4 text-xl cursor-default  ${
            done && "line-through text-black text-opacity-40"
          }`}
        >
          {name}
        </h1>
      </div>
      <button className="text-xl" onClick={handleTaskDelete}>
        <IoClose className="text-2xl text-black text-opacity-0 hover:bg-black hover:bg-opacity-10 group-hover:text-opacity-70 rounded-lg" />
      </button>
    </div>
  );
}
