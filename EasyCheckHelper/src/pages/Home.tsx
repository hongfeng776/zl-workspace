import StatusCard from '@/components/StatusCard';
import TypeSelector from '@/components/TypeSelector';
import CheckinButton from '@/components/CheckinButton';
import Calendar from '@/components/Calendar';

const Home = () => {
  return (
    <div className="space-y-4">
      <StatusCard />
      <TypeSelector />
      <CheckinButton />
      <Calendar />
    </div>
  );
};

export default Home;
